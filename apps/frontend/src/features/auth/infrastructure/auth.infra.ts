import type { AuthUser } from '@features/auth/store/auth.store';
import { httpClient } from '@shared/infrastructure/httpClient';

export interface ILoginCredentials {
  readonly email: string;
  readonly password: string;
}

export interface ILoginResult {
  readonly user: AuthUser;
  readonly token: string;
}

// Respuesta de `POST /auth/dev-login` (AUTH-1, backend verificado) — subconjunto
// local de `IAuthToken`/`User` de `@ibm-talent-bridge/shared-types`, solo los
// campos que esta infra consume.
interface IDevLoginResponse {
  readonly accessToken: string;
  readonly user: {
    readonly id:    string;
    readonly email: string;
    readonly fullName: AuthUser['name'];
    readonly role:  AuthUser['role'];
  };
}

// AUTH-1: dev-login real contra el backend. Solo se envía `email` — el
// endpoint no tiene concepto de contraseña; `password` se mantiene en
// `ILoginCredentials` únicamente para que `useLoginForm` no cambie de firma.
export async function loginUser({ email }: ILoginCredentials): Promise<ILoginResult> {
  const { accessToken, user } = await httpClient.post<IDevLoginResponse>('/auth/dev-login', { email });

  return {
    token: accessToken,
    user: {
      id:    user.id,
      email: user.email,
      role:  user.role,
      name:  user.fullName,
    },
  };
}

// Motivo del cierre de sesión que el backend registra en `auth_events`.
// Única definición: el idle timer reutilizará `'idle'`.
export type TLogoutReason = 'manual' | 'idle' | 'expired';

// QW-2: `POST /auth/logout` responde 204 sin cuerpo. Si el token ya venció el
// backend responde 401 y `httpClient` limpia la sesión (idempotente con el
// `clearAuth` posterior del hook).
export async function logoutUser(reason: TLogoutReason): Promise<void> {
  await httpClient.post<null>('/auth/logout', { reason });
}
