import type { JSX } from 'react';
import { IdleWarningDialog } from '@features/auth/components/molecules/IdleWarningDialog';
import { useIdleTimer } from '@features/auth/hooks/useIdleTimer';
import { useLogoutMutation } from '@features/auth/hooks/useLogoutMutation';

/**
 * IdleWarningModal — aviso de cierre por inactividad con cuenta atrás.
 * Se monta solo bajo el árbol de rutas protegido (DT-015); no pinta nada
 * mientras el usuario está activo.
 */
export function IdleWarningModal(): JSX.Element | null {
  const { secondsLeft, stayConnected } = useIdleTimer();
  const { mutate: logout } = useLogoutMutation();

  if (secondsLeft === null) return null;

  return (
    <IdleWarningDialog secondsLeft={secondsLeft} onStay={stayConnected} onLogout={() => logout('manual')} />
  );
}
