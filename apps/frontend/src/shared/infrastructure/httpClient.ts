import { ENV } from '@/config/env';
import { useAuthStore } from '@features/auth/store/auth.store';
import { HttpError } from './httpError';

/**
 * httpClient — wrapper de `fetch` único para toda llamada HTTP real del
 * frontend. Base URL desde `config/env.ts`, Bearer token desde el store de
 * auth, JSON de punta a punta, y todo fallo se relanza como `HttpError`
 * (nunca un `catch {}` silencioso). Un 401 con sesión activa significa token
 * vencido o inválido: se limpia la sesión y `ProtectedRoute` redirige a /login.
 */
export type THttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export interface IHttpRequestOptions {
  readonly method?:  THttpMethod;
  readonly body?:    unknown;
  readonly headers?: Readonly<Record<string, string>>;
}

const UNAUTHORIZED_STATUS = 401;

function isErrorPayload(data: unknown): data is { message: string } {
  return typeof data === 'object' && data !== null && typeof (data as { message?: unknown }).message === 'string';
}

function buildHeaders(token: string | null, custom?: Readonly<Record<string, string>>): HeadersInit {
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...custom,
  };
}

async function parseJsonBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new HttpError(response.status, 'Respuesta del servidor no es JSON válido.');
  }
}

async function fetchResponse(url: string, method: THttpMethod, body: unknown, headers: HeadersInit): Promise<Response> {
  try {
    return await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    throw new HttpError(0, error instanceof Error ? error.message : 'Error de red desconocido.');
  }
}

// Solo con el token enviado en ESTA request y aún vigente en el store: un 401
// de `dev-login` (email no sembrado) llega sin sesión y es error del formulario,
// y un 401 tardío de un token viejo no debe cerrar una sesión nueva (re-login).
function endSessionIfExpired(status: number, sentToken: string | null): void {
  if (status !== UNAUTHORIZED_STATUS || !sentToken) return;
  const { token, clearAuth } = useAuthStore.getState();
  if (token === sentToken) clearAuth();
}

export async function httpRequest<T>(path: string, options: IHttpRequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers } = options;
  const sentToken = useAuthStore.getState().token;
  const response = await fetchResponse(`${ENV.VITE_API_URL}${path}`, method, body, buildHeaders(sentToken, headers));
  const data = await parseJsonBody(response);

  if (!response.ok) {
    endSessionIfExpired(response.status, sentToken);
    const message = isErrorPayload(data) ? data.message : `Error HTTP ${response.status}`;
    throw new HttpError(response.status, message);
  }

  return data as T;
}

export const httpClient = {
  get:    <T>(path: string, headers?: Readonly<Record<string, string>>): Promise<T> =>
    httpRequest<T>(path, { method: 'GET', headers }),
  post:   <T>(path: string, body?: unknown, headers?: Readonly<Record<string, string>>): Promise<T> =>
    httpRequest<T>(path, { method: 'POST', body, headers }),
  patch:  <T>(path: string, body?: unknown, headers?: Readonly<Record<string, string>>): Promise<T> =>
    httpRequest<T>(path, { method: 'PATCH', body, headers }),
  delete: <T>(path: string, headers?: Readonly<Record<string, string>>): Promise<T> =>
    httpRequest<T>(path, { method: 'DELETE', headers }),
};
