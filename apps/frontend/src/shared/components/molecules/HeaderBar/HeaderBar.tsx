import type { JSX, ReactNode } from 'react';
import { Avatar } from '@shared/components/atoms/Avatar';
import { Icon } from '@shared/components/atoms/Icon';
import { SidebarHeader } from '@shared/components/molecules/SidebarHeader/SidebarHeader';
import { NOTIFICATIONS_PANEL_ID, SEARCH_PANEL_ID, SHELL_COPY, unreadLabel } from '@shared/config/shell.copy';
import type { TShellPanel } from '@shared/store/ui.store';

export interface HeaderBarProps {
  readonly userName:              string;
  readonly unreadCount:           number;
  readonly activePanel:           TShellPanel | null;
  readonly onToggleSearch:        () => void;
  readonly onToggleNotifications: () => void;
}

const CELL = 'relative flex items-center justify-center w-12 h-12 text-carbon-gray-10 hover:bg-carbon-gray-hover-2 '
  + 'focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-carbon-blue-60';

interface ICellProps {
  readonly label:    string;
  readonly controls: string;
  readonly open:     boolean;
  readonly onClick:  () => void;
  readonly children: ReactNode;
}

function HeaderCell({ label, controls, open, onClick, children }: ICellProps): JSX.Element {
  return (
    <button
      type="button" aria-label={label} aria-expanded={open} aria-controls={controls} onClick={onClick}
      className={`${CELL} ${open ? 'bg-carbon-gray-80' : ''}`}
    >
      {children}
    </button>
  );
}

/** Header fijo del shell (48px): marca + buscar, notificaciones y avatar. Solo props. */
export function HeaderBar({
  userName, unreadCount, activePanel, onToggleSearch, onToggleNotifications,
}: HeaderBarProps): JSX.Element {
  return (
    <header className="fixed top-0 inset-x-0 z-header flex h-header bg-carbon-gray-100 border-b border-carbon-gray-80">
      <SidebarHeader />
      <div className="flex ml-auto">
        <HeaderCell label={SHELL_COPY.searchLabel} controls={SEARCH_PANEL_ID} open={activePanel === 'search'} onClick={onToggleSearch}>
          <Icon name="search" size={20} />
        </HeaderCell>
        <HeaderCell label={unreadLabel(unreadCount)} controls={NOTIFICATIONS_PANEL_ID} open={activePanel === 'notifications'} onClick={onToggleNotifications}>
          <Icon name="bell" size={20} />
          {unreadCount > 0 && (
            <span
              aria-hidden="true"
              className="absolute top-[10px] right-[10px] min-w-[16px] h-4 px-1 rounded-pill bg-carbon-red text-white text-[10px] leading-4 font-semibold"
            >
              {unreadCount}
            </span>
          )}
        </HeaderCell>
        <div className="flex items-center justify-center w-12 h-12">
          <Avatar name={userName} size="compact" className="!bg-carbon-red" />
        </div>
      </div>
    </header>
  );
}
