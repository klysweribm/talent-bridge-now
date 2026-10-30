import { useAuthStore, type UserRole } from '../store/auth.store';
import { isTokenExpired } from '../utils/tokenExpiry';

export interface IAuthSession {
  readonly isAuthenticated: boolean;
  readonly token:           string | null;
  readonly role:            UserRole | undefined;
}

/**
 * Única fuente de la regla "token vencido = sin sesión durante el render"
 * (falla cerrado, DT-016). Todas las guardas de ruta la reutilizan.
 */
export function useAuthSession(): IAuthSession {
  const token = useAuthStore(state => state.token);
  const role  = useAuthStore(state => state.user?.role);
  return {
    isAuthenticated: token !== null && !isTokenExpired(token),
    token,
    role,
  };
}
