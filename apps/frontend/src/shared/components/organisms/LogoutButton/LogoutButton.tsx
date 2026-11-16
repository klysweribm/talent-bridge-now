import type { JSX } from 'react';
import { useLogoutMutation } from '@features/auth/hooks/useLogoutMutation';
import { Button } from '@shared/components/atoms/Button';
import { Icon } from '@shared/components/atoms/Icon';

export function LogoutButton(): JSX.Element {
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
      <span>Cerrar sesión</span>
    </Button>
  );
}
