import type { AuthUser } from '@features/auth/store/auth.store';

export interface ILoginCredentials {
  readonly email: string;
  readonly password: string;
}

export interface ILoginResult {
  readonly user: AuthUser;
  readonly token: string;
}

const SIMULATED_LATENCY_MS = 800;

// MVP: mock login — cuando exista el backend, este cuerpo cambia a
// POST /api/auth/login; el hook y los componentes que lo consumen no se tocan.
export function loginUser({ email, password }: ILoginCredentials): Promise<ILoginResult> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email.endsWith('@ibm.com') && password.length >= 6) {
        resolve({
          user: { id: '1', name: 'Usuario IBM', email, role: 'recruiter' },
          token: 'mock-jwt-token',
        });
      } else {
        reject(new Error('Credenciales incorrectas. Verifica tu correo y contraseña.'));
      }
    }, SIMULATED_LATENCY_MS);
  });
}
