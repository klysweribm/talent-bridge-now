import type { JSX } from 'react';
import { useAuthStore } from '@features/auth/store/auth.store';
import { ROLE_LABELS } from '@/config/design-tokens';
import { LogoutButton } from '@shared/components/organisms/LogoutButton/LogoutButton';
import { SidebarNavList } from '@shared/components/molecules/SidebarNavList/SidebarNavList';
import { UserFooter } from '@shared/components/molecules/UserFooter/UserFooter';
import { SHELL_COPY } from '@shared/config/shell.copy';
import { useVisibleNavItems } from '@shared/hooks/useVisibleNavItems';

/** Sidebar desktop fijo (256px, sin colapso) bajo el header: composición de piezas. */
export function SidebarNav(): JSX.Element {
  const user  = useAuthStore(state => state.user);
  const items = useVisibleNavItems();

  return (
    <aside
      aria-label="Barra lateral"
      className="hidden md:flex fixed top-header left-0 bottom-0 z-sidebar w-sidebar flex-col bg-white border-r border-carbon-gray-20"
    >
      <nav aria-label="Navegación principal" className="flex-1 overflow-y-auto">
        <SidebarNavList items={items} />
      </nav>
      <UserFooter name={user?.name ?? SHELL_COPY.userMenuFallback} roleLabel={user ? ROLE_LABELS[user.role] : ''}>
        <LogoutButton />
      </UserFooter>
    </aside>
  );
}
