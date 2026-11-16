import type { ReactNode } from 'react';
import { Icon } from '@shared/components/atoms/Icon';

export type TNotificationKind = 'warning' | 'info' | 'error';

export interface InlineNotificationProps {
  readonly kind:       TNotificationKind;
  readonly children:   ReactNode;
  /** Por defecto: `alert` para error/advertencia y `status` para info. */
  readonly role?:      'alert' | 'status';
  readonly className?: string;
}

const KIND_STYLE: Readonly<Record<TNotificationKind, { readonly box: string; readonly icon: string; readonly color: string }>> = {
  warning: { box: 'border-carbon-yellow bg-carbon-yellow-tag-bg ring-1 ring-inset ring-carbon-yellow-ring', icon: 'status-warning', color: 'text-carbon-yellow-dot' },
  info:    { box: 'border-carbon-blue-60 bg-carbon-blue-10', icon: 'status-info', color: 'text-carbon-blue-60' },
  error:   { box: 'border-carbon-red bg-carbon-red-10', icon: 'status-warning', color: 'text-carbon-red' },
};

/** Notificación inline del prototipo: borde izquierdo de 3px, icono de estado de 20px. */
export function InlineNotification({ kind, children, role, className = '' }: InlineNotificationProps): JSX.Element {
  const style = KIND_STYLE[kind];
  return (
    <div
      role={role ?? (kind === 'info' ? 'status' : 'alert')}
      className={`flex items-start gap-sm border-l-[3px] px-base py-[14px] text-body text-carbon-gray-100 ${style.box} ${className}`}
    >
      <Icon name={style.icon} size={20} className={style.color} />
      <div className="flex flex-1 flex-wrap items-center justify-between gap-md">{children}</div>
    </div>
  );
}
