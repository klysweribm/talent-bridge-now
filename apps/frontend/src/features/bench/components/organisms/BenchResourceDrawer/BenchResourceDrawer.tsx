import { useRef } from 'react';
import { Button } from '@shared/components/atoms/Button';
import { useBenchResource } from '../../../hooks/useBenchResource';
import { useDialogFocus } from '../../../hooks/useDialogFocus';
import { ResourceDetailSections } from '../../molecules/ResourceDetailSections';

export interface BenchResourceDrawerProps {
  readonly code:    string;
  readonly onClose: () => void;
}

const TITLE_ID = 'bench-drawer-title';

export function BenchResourceDrawer({ code, onClose }: BenchResourceDrawerProps): JSX.Element {
  const ref = useRef<HTMLElement>(null);
  const { data, isPending, isError } = useBenchResource(code);
  useDialogFocus(ref, `[data-resource-code="${code.replace(/"/g, '\\"')}"]`, onClose);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-text-primary/40">
      <aside
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={TITLE_ID}
        tabIndex={-1}
        className="w-full max-w-md h-full overflow-y-auto bg-surface-card p-lg shadow-modal flex flex-col gap-lg"
      >
        <header className="flex items-start justify-between gap-md">
          <h2 id={TITLE_ID} className="text-headline-sm text-text-primary">
            {data ? `${data.displayName} · ${data.benchCode}` : code}
          </h2>
          <Button variant="ghost" size="sm" aria-label="Cerrar detalle" onClick={onClose}>Cerrar</Button>
        </header>
        {isPending && <p className="text-body-md text-text-secondary">Cargando…</p>}
        {isError && <p role="alert" className="text-body-md text-status-danger">No pudimos cargar el recurso.</p>}
        {data && <ResourceDetailSections resource={data} />}
      </aside>
    </div>
  );
}
