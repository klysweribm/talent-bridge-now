import { useEffect } from 'react';
import { Icon } from '@shared/components/atoms/Icon';

export interface ToastProps {
  readonly title:         string;
  readonly message?:      string;
  readonly dismissLabel:  string;
  readonly onDismiss:     () => void;
  /** Milisegundos hasta el autodescarte; por defecto 4500. */
  readonly durationMs?:   number;
}

export const TOAST_DEFAULT_DURATION_MS = 4500;

/** Toast de éxito del prototipo: 360px, arriba a la derecha, se descarta solo. Aún sin cablear a pantallas. */
export function Toast({ title, message, dismissLabel, onDismiss, durationMs = TOAST_DEFAULT_DURATION_MS }: ToastProps): JSX.Element {
  useEffect(() => {
    const timer = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(timer);
  }, [onDismiss, durationMs]);

  return (
    <div
      role="status"
      className="fixed right-base top-16 z-toast flex w-[360px] max-w-[calc(100%-32px)] items-start gap-sm border-l-[3px] border-carbon-green bg-carbon-green-toast px-base py-[14px] shadow-overlay"
    >
      <Icon name="status-check" size={20} className="text-carbon-green" />
      <div className="flex-1 text-body text-carbon-gray-100">
        <p className="font-semibold">{title}</p>
        {message && <p>{message}</p>}
      </div>
      <button
        type="button" aria-label={dismissLabel} onClick={onDismiss}
        className="flex h-6 w-6 items-center justify-center text-carbon-gray-100 hover:bg-carbon-gray-hover focus-visible:outline-2 focus-visible:outline-carbon-blue-60"
      >
        <Icon name="close" size={16} />
      </button>
    </div>
  );
}
