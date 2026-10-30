import type { JSX } from 'react';
import { NavLink } from 'react-router-dom';
import { Icon } from '@shared/components/atoms/Icon';
import type { INavItem } from '@shared/config/navigation';

export interface SidebarNavListProps {
  readonly items:     readonly INavItem[];
  readonly collapsed: boolean;
}

const LINK_BASE = 'flex items-center gap-sm rounded-lg px-md min-h-10 text-body-md transition-colors duration-150';

export function SidebarNavList({ items, collapsed }: SidebarNavListProps): JSX.Element {
  return (
    <ul className="flex flex-col gap-xs p-sm">
      {items.map(item => (
        <li key={item.path}>
          <NavLink
            to={item.path}
            aria-label={item.label}
            title={item.label}
            className={({ isActive }) =>
              `${LINK_BASE} ${isActive
                ? 'bg-primary-fixed text-primary font-medium'
                : 'text-text-secondary hover:bg-surface-low'}`}
          >
            <Icon name={item.icon} size={20} />
            <span className={collapsed ? 'hidden' : 'truncate'}>{item.label}</span>
          </NavLink>
        </li>
      ))}
    </ul>
  );
}
