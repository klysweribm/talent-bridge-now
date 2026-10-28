import { useActiveProcessesQuery } from '../../../hooks/useActiveProcessesQuery';
import { DashboardSection } from '../../molecules/DashboardSection';
import { EmptyMessage } from '../../molecules/EmptyMessage';
import { ProcessRow } from '../../molecules/ProcessRow';

export const ACTIVE_PROCESSES_LIMIT = 5;

export function ActiveProcessesList(): JSX.Element | null {
  const { data } = useActiveProcessesQuery(ACTIVE_PROCESSES_LIMIT);
  if (!data) return null;

  const seeAll = data.total > ACTIVE_PROCESSES_LIMIT
    ? { to: '/processes?status=active', label: 'Ver todos' }
    : undefined;

  return (
    <DashboardSection title="Procesos activos" headingId="active-processes-heading" seeAll={seeAll}>
      {data.items.length === 0 ? (
        <EmptyMessage text="Aún no hay procesos." action={{ to: '/processes/new', label: 'Crear el primero' }} />
      ) : (
        <ul className="flex flex-col gap-xs">
          {data.items.map(process => <ProcessRow key={process.id} process={process} />)}
        </ul>
      )}
    </DashboardSection>
  );
}
