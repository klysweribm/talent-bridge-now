import type { JSX } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthSession } from '@features/auth/hooks/useAuthSession';
import { useSessionExpiry } from '@features/auth/hooks/useSessionExpiry';
import { LOGIN_PATH } from '../../paths';

/**
 * Autenticación: sin sesión vigente → /login; con sesión → rutas hijas.
 * `useSessionExpiry` vive aquí (antes del redirect) para limpiar del store un
 * token ya vencido tras F5 y cerrar la sesión al llegar el `exp` con la pantalla abierta.
 */
export function ProtectedRoute(): JSX.Element {
  const { isAuthenticated, token } = useAuthSession();
  useSessionExpiry(token);
  return isAuthenticated ? <Outlet /> : <Navigate to={LOGIN_PATH} replace />;
}
