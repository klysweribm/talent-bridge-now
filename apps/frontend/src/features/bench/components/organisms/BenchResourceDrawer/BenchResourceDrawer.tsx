import { SidePanel } from '@shared/components/organisms/SidePanel/SidePanel';
import { useBenchResource } from '../../../hooks/useBenchResource';
import { ResourceDetailSections } from '../../molecules/ResourceDetailSections';

export interface BenchResourceDrawerProps {
  readonly code:    string;
  readonly onClose: () => void;
}

const TITLE_ID = 'bench-drawer-title';

export function BenchResourceDrawer({ code, onClose }: BenchResourceDrawerProps): JSX.Element {
  const { data, isPending, isError } = useBenchResource(code);
  const row = (): HTMLElement | null =>
    document.querySelector<HTMLElement>(`[data-resource-code="${code.replace(/"/g, '\\"')}"]`);

  return (
    <SidePanel
      title={data ? `${data.displayName} · ${data.benchCode}` : code}
      titleId={TITLE_ID}
      closeLabel="Cerrar detalle"
      width="md"
      onClose={onClose}
      returnFocusTo={row}
    >
      <div className="flex flex-col gap-lg">
        {isPending && <p className="text-body-md text-text-secondary">Cargando…</p>}
        {isError && <p role="alert" className="text-body-md text-status-danger">No pudimos cargar el recurso.</p>}
        {data && <ResourceDetailSections resource={data} />}
      </div>
    </SidePanel>
  );
}
