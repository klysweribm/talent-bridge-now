import { useRef, type JSX } from 'react';
import { NotificationRow } from '@shared/components/molecules/NotificationRow/NotificationRow';
import { NOTIFICATIONS_PANEL_ID, SHELL_COPY } from '@shared/config/shell.copy';
import { useDialogFocus } from '@shared/hooks/useDialogFocus';
import { useNotificationsStore } from '@shared/store/notifications.store';

export interface NotificationsPanelProps {
  readonly onClose:        () => void;
  readonly returnFocusTo?: () => HTMLElement | null;
}

/** Panel lateral derecho de notificaciones (mock en Zustand). Se monta solo abierto. */
export function NotificationsPanel({ onClose, returnFocusTo }: NotificationsPanelProps): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const items = useNotificationsStore(state => state.items);
  const markRead = useNotificationsStore(state => state.markRead);
  const markAllRead = useNotificationsStore(state => state.markAllRead);
  useDialogFocus(ref, returnFocusTo, onClose);

  return (
    <>
      <div aria-hidden="true" onClick={onClose} className="fixed inset-x-0 top-header bottom-0 z-scrim bg-scrim-light" />
      <div
        ref={ref} id={NOTIFICATIONS_PANEL_ID} role="dialog" aria-label={SHELL_COPY.notificationsLabel} tabIndex={-1}
        className="fixed top-header right-0 bottom-0 z-panel flex flex-col w-panel max-w-full bg-white shadow-overlay"
      >
        <div className="flex items-center justify-between p-base border-b border-carbon-gray-20">
          <h2 className="text-h2">{SHELL_COPY.notificationsLabel}</h2>
          <button
            type="button" onClick={markAllRead}
            className="h-8 px-sm text-body text-carbon-blue-60 hover:bg-carbon-gray-hover focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-carbon-blue-60"
          >
            {SHELL_COPY.markAllRead}
          </button>
        </div>
        {items.length === 0 && <p className="p-base text-carbon-gray-70">{SHELL_COPY.noNotifications}</p>}
        <ul className="flex-1 overflow-y-auto">
          {items.map(item => <NotificationRow key={item.id} notification={item} onRead={markRead} />)}
        </ul>
      </div>
    </>
  );
}
