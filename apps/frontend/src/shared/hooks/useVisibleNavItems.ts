import { useAuthStore } from '@features/auth/store/auth.store';
import { NAVIGATION_ITEMS, type INavItem } from '@shared/config/navigation';

/** Ítems de navegación permitidos para el rol de la sesión (fuente: navigation.ts). */
export function useVisibleNavItems(): readonly INavItem[] {
  const role = useAuthStore(state => state.user?.role);
  return NAVIGATION_ITEMS.filter(item => role !== undefined && item.roles.includes(role));
}
