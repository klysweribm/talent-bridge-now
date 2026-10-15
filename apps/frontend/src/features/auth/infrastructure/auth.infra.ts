import type { AuthUser } from '@features/auth/store/auth.store';
import { DEMO_USERS } from './authDemoUsers';

export interface ILoginCredentials {
  readonly email: string;
  readonly password: string;
}

export interface ILoginResult {
  readonly user: AuthUser;
  readonly token: string;
}

const SIMULATED_LATENCY_MS = 800;

// MVP (temporal — ver AUTH-1): login mock contra `DEMO_USERS`. Cuando exista
// el backend, este cuerpo cambia a POST /api/auth/login; el hook y los
// componentes que lo consumen no se tocan (misma firma).
export function loginUser({ email, password }: ILoginCredentials): Promise<ILoginResult> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (password.length < 6) {
        reject(new Error('Credenciales incorrectas. Verifica tu correo y contraseña.'));
        return;
      }
      if (!email.endsWith('@ibm.com')) {
        reject(new Error('Credenciales incorrectas. Verifica tu correo y contraseña.'));
        return;
      }

      const demoUser = DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!demoUser) {
        reject(new Error('Usuario no provisionado. Contacta a tu administrador IBM.'));
        return;
      }

      resolve({ user: demoUser, token: 'mock-jwt-token' });
    }, SIMULATED_LATENCY_MS);
  });
}
