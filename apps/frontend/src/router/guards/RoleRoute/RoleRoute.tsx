import type { JSX } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthSession } from '@features/auth/hooks/useAuthSession';
import type { UserRole } from '@features/auth/store/auth.store';
import { DASHBOARD_PATH } from '../../paths';

export interface RoleRouteProps {
  readonly allowedRoles: readonly UserRole[];
}

/** Autorización por rol. Debe anidarse DENTRO de `ProtectedRoute`. */
export function RoleRoute({ allowedRoles }: RoleRouteProps): JSX.Element {
  const { role } = useAuthSession();
  const isAllowed = role !== undefined && allowedRoles.includes(role);
  return isAllowed ? <Outlet /> : <Navigate to={DASHBOARD_PATH} replace />;
}
