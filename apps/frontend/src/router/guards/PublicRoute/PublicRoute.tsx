import type { JSX } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthSession } from '@features/auth/hooks/useAuthSession';
import { DASHBOARD_PATH } from '../../paths';

/** Rutas solo para visitantes: con sesión vigente → /dashboard. */
export function PublicRoute(): JSX.Element {
  const { isAuthenticated } = useAuthSession();
  return isAuthenticated ? <Navigate to={DASHBOARD_PATH} replace /> : <Outlet />;
}
