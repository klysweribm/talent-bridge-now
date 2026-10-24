import type { UserRole } from '@ibm-talent-bridge/shared-types';

/**
 * Payload embebido en el JWT emitido por `AuthService` (hoy solo desde
 * `POST /auth/dev-login`, AUTH-1). `JwtStrategy` lo valida y lo expone en
 * `request.user` para que `RolesGuard` pueda leer el rol.
 */
export interface IJwtPayload {
  readonly sub: string;
  readonly email: string;
  readonly role: UserRole;
}
