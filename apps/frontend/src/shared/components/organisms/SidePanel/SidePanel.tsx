import { useMemo, useRef, type ReactNode } from 'react';
import { Icon } from '@shared/components/atoms/Icon';
import { useBodyScrollLock } from '@shared/hooks/useBodyScrollLock';
import { useDialogFocus, type TReturnFocusTo } from '@shared/hooks/useDialogFocus';
import { useFocusTrap } from '@shared/hooks/useFocusTrap';
import { SidePanelContext } from './SidePanelContext';

export interface SidePanelProps {
  readonly title: string;
  readonly titleId: string;
  readonly children: ReactNode;
  readonly onClose: () => void;
  readonly width: 'md' | 'lg';
  readonly closeLabel: string;
  /** Elemento (o función que lo resuelve) que recibe el foco al cerrar; por defecto, quien lo tenía al abrir. */
  readonly returnFocusTo?: TReturnFocusTo;
  /** Si devuelve false, Cerrar/Esc/clic fuera no cierran; el host decide qué mostrar. */
  readonly guardClose?: () => boolean;
}

const WIDTH = { md: 'max-w-[440px]', lg: 'max-w-[640px]' } as const;

function useGuardedClose(onClose: () => void, guard?: () => boolean): () => void {
  return () => { if (guard?.() !== false) onClose(); };
}

interface IHeaderProps {
  readonly title: string;
  readonly titleId: string;
  readonly closeLabel: string;
  readonly onClose: () => void;
}

function PanelHeader({ title, titleId, closeLabel, onClose }: IHeaderProps): JSX.Element {
  return (
    <header className="flex items-start justify-between gap-md border-b border-carbon-gray-20 py-base pl-lg pr-base">
      <h2 id={titleId} className="text-h3 text-carbon-gray-100">{title}</h2>
      <button
        type="button" aria-label={closeLabel} onClick={onClose}
        className="flex h-10 w-10 shrink-0 items-center justify-center text-carbon-gray-100 hover:bg-carbon-gray-hover focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-carbon-blue-60"
      >
        <Icon name="close" size={20} />
      </button>
    </header>
  );
}

/** Panel lateral modal: overlay con clic fuera, cabecera fija, focus trap, Esc y bloqueo de scroll. */
export function SidePanel({
  title, titleId, children, onClose, width, closeLabel, returnFocusTo, guardClose,
}: SidePanelProps): JSX.Element {
  const ref = useRef<HTMLElement>(null);
  const guardedClose = useGuardedClose(onClose, guardClose);
  const api = useMemo(() => ({ forceClose: onClose }), [onClose]);
  useDialogFocus(ref, returnFocusTo, guardedClose);
  useFocusTrap(ref);
  useBodyScrollLock();

  return (
    <div
      className="fixed inset-x-0 top-header bottom-0 z-drawer flex justify-end bg-scrim"
      onClick={(e) => { if (e.target === e.currentTarget) guardedClose(); }}
    >
      <aside
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`w-full ${WIDTH[width]} h-full flex flex-col bg-white shadow-panel`}
      >
        <PanelHeader title={title} titleId={titleId} closeLabel={closeLabel} onClose={guardedClose} />
        <div className="flex flex-1 flex-col gap-lg overflow-y-auto p-lg">
          <SidePanelContext.Provider value={api}>{children}</SidePanelContext.Provider>
        </div>
      </aside>
    </div>
  );
}
