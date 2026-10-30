import type { JSX } from 'react';
import { AppLayout } from '@shared/layouts/AppLayout';
import { NotFoundView } from '@shared/components/organisms/NotFoundView';
import { useAuthSession } from '@features/auth/hooks/useAuthSession';
import { DASHBOARD_PATH, LOGIN_PATH } from '../../paths';

// 404 dentro del layout cuando hay sesión; sin sesión, ofrece volver a /login.
export function NotFoundRoute(): JSX.Element {
  const { isAuthenticated } = useAuthSession();

  if (!isAuthenticated) {
    return <NotFoundView backTo={LOGIN_PATH} backLabel="Ir a iniciar sesión" />;
  }
  return (
    <AppLayout>
      <NotFoundView backTo={DASHBOARD_PATH} backLabel="Volver al dashboard" />
    </AppLayout>
  );
}
