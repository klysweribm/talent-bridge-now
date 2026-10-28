import type { JSX } from 'react';
import { useAuthStore } from '@features/auth/store/auth.store';
import { ROLE_LABELS } from '@/config/design-tokens';
import { LogoutButton } from '@shared/components/organisms/LogoutButton';
import { SidebarHeader } from '@shared/components/molecules/SidebarHeader';
import { SidebarNavList } from '@shared/components/molecules/SidebarNavList';
import { UserFooter } from '@shared/components/molecules/UserFooter';
import { useVisibleNavItems } from '@shared/hooks/useVisibleNavItems';
import { useUiStore } from '@shared/store/ui.store';

/** Sidebar desktop (w-64, colapsable): composición de piezas — UX-GUIDELINES §1. */
export function SidebarNav(): JSX.Element {
  const user      = useAuthStore(state => state.user);
  const items     = useVisibleNavItems();
  const collapsed = useUiStore(state => state.sidebarCollapsed);
  const toggle    = useUiStore(state => state.toggleSidebarCollapsed);

  return (
    <aside
      aria-label="Barra lateral"
      className={`hidden md:flex sidebar-collapse flex-shrink-0 flex-col h-full bg-surface-card border-r border-outline-variant ${collapsed ? 'w-16' : 'w-64'}`}
    >
      <SidebarHeader collapsed={collapsed} onToggle={toggle} />
      <nav aria-label="Navegación principal" className="flex-1 overflow-y-auto overflow-x-hidden">
        <SidebarNavList items={items} collapsed={collapsed} />
      </nav>
      <UserFooter
        name={user?.name ?? 'Usuario'}
        roleLabel={user ? ROLE_LABELS[user.role] : ''}
        collapsed={collapsed}
      >
        <LogoutButton collapsed={collapsed} />
      </UserFooter>
    </aside>
  );
}
