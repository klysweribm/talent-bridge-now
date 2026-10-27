import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { JSX, ReactNode } from 'react';
import { AppLayout } from '@shared/layouts/AppLayout';
import { ComingSoon } from '@shared/components/organisms/ComingSoon';
import { NotFoundView } from '@shared/components/organisms/NotFoundView';
import { NAVIGATION_ITEMS } from '@shared/config/navigation';
import { useAuthStore, type UserRole } from '@features/auth/store/auth.store';
import { isTokenExpired } from '@features/auth/utils/tokenExpiry';
import { useSessionExpiry } from '@features/auth/hooks/useSessionExpiry';
import { IdleWarningModal } from '@features/auth/components/organisms/IdleWarningModal';
import { LoginPage } from '@features/auth/components/pages/LoginPage';
import { DashboardPage } from '@features/processes/components/pages/DashboardPage';

interface ProtectedRouteProps {
  readonly children:      ReactNode;
  readonly allowedRoles?: readonly UserRole[];
}

function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps): JSX.Element {
  const token = useAuthStore(state => state.token);
  const role  = useAuthStore(state => state.user?.role);
  useSessionExpiry(token);

  // Token vencido = sin sesión durante el render: nunca se pinta contenido protegido.
  if (!token || isTokenExpired(token)) return <Navigate to="/login" replace />;
  if (allowedRoles && (!role || !allowedRoles.includes(role))) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <>
      <AppLayout>{children}</AppLayout>
      <IdleWarningModal />
    </>
  );
}

// 404 dentro del layout cuando hay sesión — nunca una pantalla pelada para
// un usuario autenticado; sin sesión, ofrece volver a /login.
function NotFoundRoute(): JSX.Element {
  const token = useAuthStore(state => state.token);

  if (!token || isTokenExpired(token)) {
    return <NotFoundView backTo="/login" backLabel="Ir a iniciar sesión" />;
  }
  return (
    <AppLayout>
      <NotFoundView backTo="/dashboard" backLabel="Volver al dashboard" />
    </AppLayout>
  );
}

// Rutas protegidas que no son items de sidebar (detalle/alta de proceso) —
// mismos roles que la sección padre (/processes), sin pantalla real aún.
interface IExtraRoute {
  readonly path:  string;
  readonly label: string;
  readonly roles: readonly UserRole[];
}

const EXTRA_PROTECTED_ROUTES: readonly IExtraRoute[] = [
  { path: '/processes/new', label: 'Nuevo Proceso',       roles: ['recruiter', 'pm'] },
  { path: '/processes/:id', label: 'Detalle del Proceso', roles: ['recruiter', 'pm'] },
];

// Items de navegación sin pantalla real todavía (todo salvo /dashboard) +
// rutas protegidas sin item de sidebar propio — ambos renderizan `ComingSoon`
// dentro del layout, nunca un 404.
function ComingSoonRoutes(): JSX.Element {
  return (
    <>
      {NAVIGATION_ITEMS.filter(item => item.path !== '/dashboard').map(item => (
        <Route
          key={item.path}
          path={item.path}
          element={<ProtectedRoute allowedRoles={item.roles}><ComingSoon label={item.label} /></ProtectedRoute>}
        />
      ))}
      {EXTRA_PROTECTED_ROUTES.map(route => (
        <Route
          key={route.path}
          path={route.path}
          element={<ProtectedRoute allowedRoles={route.roles}><ComingSoon label={route.label} /></ProtectedRoute>}
        />
      ))}
    </>
  );
}

export function AppRouter(): JSX.Element {
  const dashboardRoles = NAVIGATION_ITEMS.find(item => item.path === '/dashboard')?.roles;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={<ProtectedRoute allowedRoles={dashboardRoles}><DashboardPage /></ProtectedRoute>}
        />
        {ComingSoonRoutes()}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFoundRoute />} />
      </Routes>
    </BrowserRouter>
  );
}
