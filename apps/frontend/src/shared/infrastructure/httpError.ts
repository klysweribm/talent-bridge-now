/**
 * HttpError — error tipado de `httpClient`, con `status` y `message` del
 * backend cuando están disponibles. Nunca un `catch {}` silencioso: todo
 * fallo de red/parse se relanza como `HttpError` para que React Query lo
 * exponga vía su `error` state.
 */
export class HttpError extends Error {
  public readonly status: number;
  /** Cuerpo JSON de la respuesta de error, si lo hubo (p. ej. `{ reason }` en un 503). */
  public readonly body: unknown;

  public constructor(status: number, message: string, body: unknown = null) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.body = body;
  }
}
