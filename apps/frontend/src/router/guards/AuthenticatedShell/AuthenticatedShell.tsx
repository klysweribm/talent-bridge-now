import type { JSX } from 'react';
import { Outlet } from 'react-router-dom';
import { AppLayout } from '@shared/layouts/AppLayout';
import { IdleWarningModal } from '@features/auth/components/organisms/IdleWarningModal';

/**
 * Shell autenticado: layout + aviso de inactividad.
 * Vive dentro de `ProtectedRoute`, así que se desmonta al terminar la sesión.
 */
export function AuthenticatedShell(): JSX.Element {
  return (
    <>
      <AppLayout><Outlet /></AppLayout>
      <IdleWarningModal />
    </>
  );
}
