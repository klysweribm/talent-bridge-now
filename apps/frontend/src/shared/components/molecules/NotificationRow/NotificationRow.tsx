import type { JSX } from 'react';
import type { INotification } from '@shared/store/notifications.store';

export interface NotificationRowProps {
  readonly notification: INotification;
  readonly onRead:       (id: string) => void;
}

/** Fila de notificación: no leída con fondo azul claro, punto y título en negrita. Solo props. */
export function NotificationRow({ notification, onRead }: NotificationRowProps): JSX.Element {
  const { id, title, body, time, read } = notification;
  return (
    <li>
      <button
        type="button" onClick={() => onRead(id)}
        className={`flex w-full gap-md px-base py-[14px] text-left border-b border-carbon-gray-20 hover:bg-carbon-gray-hover focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-carbon-blue-60 ${read ? 'bg-white' : 'bg-carbon-blue-10'}`}
      >
        <span aria-hidden="true" className={`mt-[6px] w-2 h-2 flex-none rounded-full ${read ? 'bg-transparent' : 'bg-carbon-blue-60'}`} />
        <span className="flex flex-col gap-2xs min-w-0 text-body">
          <span className={read ? '' : 'font-semibold'}>{title}</span>
          <span className="text-carbon-gray-70">{body}</span>
          <span className="text-body-sm text-carbon-gray-60">{time}</span>
        </span>
      </button>
    </li>
  );
}
