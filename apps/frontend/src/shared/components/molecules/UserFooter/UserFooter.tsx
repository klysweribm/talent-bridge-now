import type { JSX, ReactNode } from 'react';
import { Avatar } from '@shared/components/atoms/Avatar';

export interface UserFooterProps {
  readonly name:      string;
  readonly roleLabel: string;
  /** Slot de acciones (p. ej. `LogoutButton`). */
  readonly children?: ReactNode;
}

export function UserFooter({ name, roleLabel, children }: UserFooterProps): JSX.Element {
  return (
    <div className="flex flex-col gap-sm p-base border-t border-carbon-gray-20">
      <div className="flex items-center gap-md min-w-0">
        <Avatar name={name} size="md" />
        <div className="flex flex-col min-w-0">
          <span className="truncate text-body font-semibold text-carbon-gray-100">{name}</span>
          <span className="truncate text-body-sm text-carbon-gray-60">{roleLabel}</span>
        </div>
      </div>
      {children}
    </div>
  );
}
