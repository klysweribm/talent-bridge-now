import { ENV } from '@/config/env';
import { useAuthStore } from '@features/auth/store/auth.store';
import { HttpError } from './httpError';

/**
 * httpClient — wrapper de `fetch` único para toda llamada HTTP real del
 * frontend. Base URL desde `config/env.ts`, Bearer token desde el store de
 * auth, JSON de punta a punta, y todo fallo se relanza como `HttpError`
 * (nunca un `catch {}` silencioso). Las features siguen siendo mock-first:
 * ninguna todavía importa este cliente, pero queda listo con la firma final.
 */
export type THttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export interface IHttpRequestOptions {
  readonly method?:  THttpMethod;
  readonly body?:    unknown;
  readonly headers?: Readonly<Record<string, string>>;
}

function isErrorPayload(data: unknown): data is { message: string } {
  return typeof data === 'object' && data !== null && typeof (data as { message?: unknown }).message === 'string';
}

function buildHeaders(custom?: Readonly<Record<string, string>>): HeadersInit {
  const token = useAuthStore.getState().token;
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

async function fetchResponse(url: string, method: THttpMethod, body: unknown, headers?: Readonly<Record<string, string>>): Promise<Response> {
  try {
    return await fetch(url, {
      method,
      headers: buildHeaders(headers),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    throw new HttpError(0, error instanceof Error ? error.message : 'Error de red desconocido.');
  }
}

export async function httpRequest<T>(path: string, options: IHttpRequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers } = options;
  const response = await fetchResponse(`${ENV.VITE_API_URL}${path}`, method, body, headers);
  const data = await parseJsonBody(response);

  if (!response.ok) {
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
