import type { JSX } from 'react';
import { NavLink } from 'react-router-dom';
import { Icon } from '@shared/components/atoms/Icon';
import type { INavItem } from '@shared/config/navigation';

export interface SidebarNavListProps {
  readonly items: readonly INavItem[];
}

const LINK_BASE = 'flex items-center gap-md h-10 pl-[13px] pr-base border-l-[3px] text-body '
  + 'focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-carbon-blue-60';
const ACTIVE = 'bg-carbon-gray-20 border-carbon-blue-60 font-semibold text-carbon-gray-100';
const INACTIVE = 'border-transparent text-carbon-gray-70 hover:bg-carbon-gray-hover';

export function SidebarNavList({ items }: SidebarNavListProps): JSX.Element {
  return (
    <ul className="flex flex-col pt-base">
      {items.map(item => (
        <li key={item.path}>
          <NavLink
            to={item.path}
            aria-label={item.label}
            className={({ isActive }) => `${LINK_BASE} ${isActive ? ACTIVE : INACTIVE}`}
          >
            <Icon name={item.icon} size={16} />
            <span className="truncate">{item.label}</span>
          </NavLink>
        </li>
      ))}
    </ul>
  );
}
