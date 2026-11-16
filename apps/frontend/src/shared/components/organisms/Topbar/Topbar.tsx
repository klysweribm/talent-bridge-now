import { useRef, type JSX } from 'react';
import { useAuthStore } from '@features/auth/store/auth.store';
import { HeaderBar } from '@shared/components/molecules/HeaderBar/HeaderBar';
import { NotificationsPanel } from '@shared/components/organisms/NotificationsPanel/NotificationsPanel';
import { SearchPanel } from '@shared/components/organisms/SearchPanel/SearchPanel';
import { NOTIFICATIONS_PANEL_ID, SEARCH_PANEL_ID, SHELL_COPY } from '@shared/config/shell.copy';
import { selectUnreadCount, useNotificationsStore } from '@shared/store/notifications.store';
import { useUiStore } from '@shared/store/ui.store';

/** Header del shell: cabecera fija + paneles de búsqueda y notificaciones (estado en `ui.store`). */
export function Topbar(): JSX.Element {
  const userName = useAuthStore(state => state.user?.name ?? SHELL_COPY.userMenuFallback);
  const unread = useNotificationsStore(selectUnreadCount);
  const activePanel = useUiStore(state => state.activePanel);
  const togglePanel = useUiStore(state => state.togglePanel);
  const closePanel = useUiStore(state => state.closePanel);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerFor = (controls: string) => (): HTMLElement | null =>
    wrapRef.current?.querySelector<HTMLElement>(`button[aria-controls="${controls}"]`) ?? null;

  return (
    <div ref={wrapRef}>
      <HeaderBar
        userName={userName} unreadCount={unread} activePanel={activePanel}
        onToggleSearch={() => togglePanel('search')} onToggleNotifications={() => togglePanel('notifications')}
      />
      {activePanel === 'search' && <SearchPanel onClose={closePanel} returnFocusTo={triggerFor(SEARCH_PANEL_ID)} />}
      {activePanel === 'notifications' && <NotificationsPanel onClose={closePanel} returnFocusTo={triggerFor(NOTIFICATIONS_PANEL_ID)} />}
    </div>
  );
}
