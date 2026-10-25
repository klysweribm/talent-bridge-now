// Margen de reloj (ms) restado al vencimiento. 0 = sin tolerancia: el 401 del
// backend sigue siendo la autoridad; esto solo evita pintar UI con token vencido.
export const CLOCK_SKEW_MS = 0;

const JWT_SEGMENT_COUNT = 3;
const PAYLOAD_SEGMENT_INDEX = 1;
const BASE64_BLOCK_SIZE = 4;
const MS_PER_SECOND = 1000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function decodeBase64Url(segment: string): string | null {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(Math.ceil(base64.length / BASE64_BLOCK_SIZE) * BASE64_BLOCK_SIZE, '=');
  try {
    return atob(padded);
  } catch {
    return null; // base64 inválido → token malformado
  }
}

function parsePayload(token: string): Record<string, unknown> | null {
  const segments = token.split('.');
  if (segments.length !== JWT_SEGMENT_COUNT) return null;
  const json = decodeBase64Url(segments[PAYLOAD_SEGMENT_INDEX]);
  if (json === null) return null;
  try {
    const payload: unknown = JSON.parse(json);
    return isRecord(payload) ? payload : null;
  } catch {
    return null; // payload no-JSON → token malformado
  }
}

/** Vencimiento del JWT en ms epoch, o null si el token es malformado o no trae `exp` numérico. */
export function getTokenExpiryMs(token: string): number | null {
  const exp = parsePayload(token)?.exp;
  return typeof exp === 'number' && Number.isFinite(exp) ? exp * MS_PER_SECOND : null;
}

/** Falla cerrado: un token malformado o sin `exp` cuenta como vencido. */
export function isTokenExpired(token: string, now: number = Date.now()): boolean {
  const expiryMs = getTokenExpiryMs(token);
  if (expiryMs === null) return true;
  return now >= expiryMs - CLOCK_SKEW_MS;
}
