import type { JSX } from 'react';
import { Button } from '@shared/components/atoms/Button';
import { Icon } from '@shared/components/atoms/Icon';

export interface SidebarHeaderProps {
  readonly collapsed: boolean;
  readonly onToggle:  () => void;
}

export function SidebarHeader({ collapsed, onToggle }: SidebarHeaderProps): JSX.Element {
  const toggleLabel = collapsed ? 'Expandir menú' : 'Colapsar menú';

  return (
    <div className="flex items-center gap-sm px-md h-14 flex-shrink-0 border-b border-outline-variant">
      <span
        aria-hidden="true"
        className="flex-shrink-0 flex items-center justify-center w-8 h-6 rounded bg-primary-container text-primary-on text-label-md font-bold"
      >
        IBM
      </span>
      <span className={collapsed ? 'hidden' : 'flex-1 truncate text-title-md text-text-primary'}>
        IBM Talent Bridge
      </span>
      <Button
        variant="ghost"
        size="sm"
        aria-label={toggleLabel}
        title={toggleLabel}
        aria-expanded={!collapsed}
        onClick={onToggle}
        className="!px-xs flex-shrink-0"
      >
        <Icon name="chevron_left" size={16} className={collapsed ? 'rotate-180' : ''} />
      </Button>
    </div>
  );
}
