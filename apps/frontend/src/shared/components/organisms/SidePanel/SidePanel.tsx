import { useMemo, useRef, type ReactNode } from 'react';
import { Button } from '@shared/components/atoms/Button';
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

const WIDTH = { md: 'max-w-md', lg: 'max-w-[640px]' } as const;

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
    <header className="flex items-start justify-between gap-md p-lg">
      <h2 id={titleId} className="text-headline-sm text-text-primary">{title}</h2>
      <Button variant="ghost" size="sm" aria-label={closeLabel} onClick={onClose}>Cerrar</Button>
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
      className="fixed inset-0 z-50 flex justify-end bg-text-primary/40"
      onClick={(e) => { if (e.target === e.currentTarget) guardedClose(); }}
    >
      <aside
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`w-full ${WIDTH[width]} h-full flex flex-col bg-surface-card shadow-modal`}
      >
        <PanelHeader title={title} titleId={titleId} closeLabel={closeLabel} onClose={guardedClose} />
        <div className="flex-1 overflow-y-auto px-lg pb-lg">
          <SidePanelContext.Provider value={api}>{children}</SidePanelContext.Provider>
        </div>
      </aside>
    </div>
  );
}
