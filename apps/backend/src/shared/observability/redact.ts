export const REDACTED = '[REDACTED]';

const SECRET_KEYS: ReadonlySet<string> = new Set([
  'authorization',
  'cookie',
  'set-cookie',
  'password',
  'token',
  'accesstoken',
  'refreshtoken',
  'otp',
  'secret',
  'apikey',
  'x-api-key',
]);
const MAX_DEPTH = 6;
const MAX_ARRAY_ITEMS = 10;
const MAX_STRING_LENGTH = 300;
const JWT_PATTERN = /^eyJ[\w-]+\.[\w-]+\.[\w-]*$/;
const BEARER_PATTERN = /^Bearer\s+\S+/i;

function redactString(value: string): string {
  if (JWT_PATTERN.test(value) || BEARER_PATTERN.test(value)) return REDACTED;
  if (value.length <= MAX_STRING_LENGTH) return value;
  return `${value.slice(0, MAX_STRING_LENGTH)}... (+${value.length - MAX_STRING_LENGTH} chars)`;
}

function isStream(value: object): boolean {
  return typeof (value as { pipe?: unknown }).pipe === 'function';
}

function walk(value: unknown, depth: number, ancestors: WeakSet<object>): unknown {
  if (typeof value === 'string') return redactString(value);
  if (typeof value === 'bigint') return value.toString();
  if (typeof value === 'function') return '[Function]';
  if (value === null || typeof value !== 'object') return value;
  if (value instanceof Uint8Array || isStream(value)) return '[binary]';
  if (value instanceof Date) return value.toISOString();
  if (ancestors.has(value)) return '[Circular]';
  if (depth >= MAX_DEPTH) return '[MaxDepth]';

  ancestors.add(value);
  try {
    if (Array.isArray(value)) {
      const items = value
        .slice(0, MAX_ARRAY_ITEMS)
        .map((item: unknown) => walk(item, depth + 1, ancestors));
      if (value.length > MAX_ARRAY_ITEMS) items.push(`(+${value.length - MAX_ARRAY_ITEMS} más)`);
      return items;
    }
    const copy: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value)) {
      copy[key] = SECRET_KEYS.has(key.toLowerCase()) ? REDACTED : walk(entry, depth + 1, ancestors);
    }
    return copy;
  } finally {
    ancestors.delete(value);
  }
}

/** Copia recursiva con las claves secretas y los valores con forma de JWT/Bearer ocultos. */
export function redact(value: unknown): unknown {
  return walk(value, 0, new WeakSet<object>());
}
