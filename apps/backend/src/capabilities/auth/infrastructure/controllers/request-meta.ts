import type { Request } from 'express';
import type { IRequestMeta } from '../../domain/interfaces/auth-event.interface';

/**
 * `ip` y `userAgent` son datos personales (solo van a `auth_events`, con TTL).
 * Detrás de Vite/nginx `req.ip` es la IP del proxy salvo que se configure `trust proxy`.
 */
export function requestMeta(req: Request): IRequestMeta {
  return { ip: req.ip, userAgent: req.get('user-agent') };
}
