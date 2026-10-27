/** Motivos válidos de cierre de sesión (fuente única; el DTO y el schema lo reutilizan). */
export const LOGOUT_REASONS = ['manual', 'idle', 'expired'] as const;
export type TLogoutReason = (typeof LOGOUT_REASONS)[number];

export const AUTH_EVENT_TYPES = ['login', 'logout'] as const;
export type TAuthEventType = (typeof AUTH_EVENT_TYPES)[number];

/**
 * Metadatos de la petición. `ip` y `userAgent` son datos personales: solo se
 * guardan en `auth_events` (con TTL). Detrás de Vite/nginx `req.ip` es la IP del
 * proxy salvo que se configure `trust proxy` (ver nota en AuthController).
 */
export interface IRequestMeta {
  readonly ip?: string;
  readonly userAgent?: string;
}

export interface IAuthEvent extends IRequestMeta {
  readonly userId: string;
  readonly type: TAuthEventType;
  readonly reason?: TLogoutReason;
  readonly at: Date;
}
