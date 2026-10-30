import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { JSX } from 'react';
import { LoginPage } from '@features/auth/components/pages/LoginPage';
import { AuthenticatedShell } from './guards/AuthenticatedShell';
import { NotFoundRoute } from './guards/NotFoundRoute';
import { ProtectedRoute } from './guards/ProtectedRoute';
import { PublicRoute } from './guards/PublicRoute';
import { RoleRoute } from './guards/RoleRoute';
import { DASHBOARD_PATH, LOGIN_PATH, ROOT_PATH } from './paths';
import { ROLE_GROUPS } from './routes.config';

export function AppRouter(): JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path={LOGIN_PATH} element={<LoginPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route element={<AuthenticatedShell />}>
            {ROLE_GROUPS.map(group => (
              <Route key={group.roles.join(',')} element={<RoleRoute allowedRoles={group.roles} />}>
                {group.routes.map(route => (
                  <Route key={route.path} path={route.path} element={route.element} />
                ))}
              </Route>
            ))}
          </Route>
        </Route>
        <Route path={ROOT_PATH} element={<Navigate to={DASHBOARD_PATH} replace />} />
        <Route path="*" element={<NotFoundRoute />} />
      </Routes>
    </BrowserRouter>
  );
}
