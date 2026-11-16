import { Button } from '@shared/components/atoms/Button';
import { SidePanel } from '@shared/components/organisms/SidePanel/SidePanel';
import { BENCH_COPY } from '../../../config/bench.constants';
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
        {isPending && <p className="text-body text-carbon-gray-70">Cargando…</p>}
        {isError && <p role="alert" className="text-body text-carbon-red">No pudimos cargar el recurso.</p>}
        {data && <ResourceDetailSections resource={data} />}
      </div>
      <footer className="sticky -bottom-lg -mx-lg -mb-lg mt-auto flex border-t border-carbon-gray-20 bg-white">
        <Button variant="secondary" size="xl" className="flex-1" onClick={onClose}>{BENCH_COPY.closeDetail}</Button>
      </footer>
    </SidePanel>
  );
}
