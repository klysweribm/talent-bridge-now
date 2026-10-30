import type { JSX } from 'react';
import { useLogoutMutation } from '@features/auth/hooks/useLogoutMutation';
import { Button } from '@shared/components/atoms/Button';
import { Icon } from '@shared/components/atoms/Icon';

export interface LogoutButtonProps {
  /** Oculta el texto (sidebar colapsado); el nombre accesible se mantiene. */
  readonly collapsed?: boolean;
}

export function LogoutButton({ collapsed = false }: LogoutButtonProps): JSX.Element {
  const logout = useLogoutMutation();

  return (
    <Button
      variant="ghost"
      size="sm"
      aria-label="Cerrar sesión"
      title="Cerrar sesión"
      onClick={() => logout.mutate('manual')}
      className="w-full !justify-start"
    >
      <Icon name="logout" size={18} />
      {!collapsed && <span>Cerrar sesión</span>}
    </Button>
  );
}
