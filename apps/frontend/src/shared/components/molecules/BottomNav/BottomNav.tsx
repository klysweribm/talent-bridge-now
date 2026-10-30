import type { JSX } from 'react';
import { NavLink } from 'react-router-dom';
import { Icon } from '@shared/components/atoms/Icon';
import type { INavItem } from '@shared/config/navigation';

export interface BottomNavProps {
  readonly items: readonly INavItem[];
}

/** UX-GUIDELINES §1: bottom nav mobile con los ítems del rol, máximo 5. */
export const BOTTOM_NAV_MAX_ITEMS = 5;

export function BottomNav({ items }: BottomNavProps): JSX.Element {
  return (
    <nav
      aria-label="Navegación principal"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex h-14 bg-surface-card border-t border-outline-variant"
    >
      {items.slice(0, BOTTOM_NAV_MAX_ITEMS).map(item => (
        <NavLink
          key={item.path}
          to={item.path}
          aria-label={item.label}
          className={({ isActive }) =>
            `flex-1 min-w-0 flex flex-col items-center justify-center gap-2xs text-label-sm ${
              isActive ? 'text-primary font-medium' : 'text-text-secondary'}`}
        >
          <Icon name={item.icon} size={20} />
          <span className="truncate max-w-full">{item.mobileLabel}</span>
        </NavLink>
      ))}
    </nav>
  );
}
