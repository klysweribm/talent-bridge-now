import type { JSX, ReactNode } from 'react';
import { Avatar } from '@shared/components/atoms/Avatar';

export interface UserFooterProps {
  readonly name:      string;
  readonly roleLabel: string;
  readonly collapsed: boolean;
  /** Slot de acciones (p. ej. `LogoutButton`). */
  readonly children?: ReactNode;
}

export function UserFooter({ name, roleLabel, collapsed, children }: UserFooterProps): JSX.Element {
  return (
    <div className="flex flex-col gap-sm p-md border-t border-outline-variant">
      <div className="flex items-center gap-sm min-w-0">
        <Avatar name={name} size="md" />
        <div className={collapsed ? 'hidden' : 'flex flex-col min-w-0'}>
          <span className="truncate text-body-md-medium text-text-primary">{name}</span>
          <span className="truncate text-label-sm text-text-secondary">{roleLabel}</span>
        </div>
      </div>
      {children}
    </div>
  );
}
