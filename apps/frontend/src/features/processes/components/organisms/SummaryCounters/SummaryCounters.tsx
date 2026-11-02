import { PROCESSES_PATH } from '@/router/paths';
import { PROCESS_LIST_COPY } from '../../../config/processList.constants';
import { useCanSeeProcesses } from '../../../hooks/useCanSeeProcesses';
import { useDashboardSummaryQuery } from '../../../hooks/useDashboardSummaryQuery';
import { useProcessTotal } from '../../../hooks/useProcessTotal';
import { CounterCard } from '../../molecules/CounterCard';

const GRID_WITH_PROCESSES = 'grid grid-cols-1 sm:grid-cols-3 gap-base';
const GRID_WITHOUT_PROCESSES = 'grid grid-cols-1 sm:grid-cols-2 gap-base';

export function SummaryCounters(): JSX.Element | null {
  const canSee = useCanSeeProcesses();
  const { data } = useDashboardSummaryQuery();
  const total = useProcessTotal(canSee);
  if (!data) return null;

  const processesValue = total.isError ? PROCESS_LIST_COPY.counterError
    : total.data ? total.data.total : PROCESS_LIST_COPY.counterLoading;

  return (
    <section aria-label="Resumen" className={canSee ? GRID_WITH_PROCESSES : GRID_WITHOUT_PROCESSES}>
      {canSee && <CounterCard label={PROCESS_LIST_COPY.activeTitle} value={processesValue} to={PROCESSES_PATH} icon="processes" />}
      <CounterCard label="Entrevistas hoy" value={data.interviewsToday} to="/interviews?date=today" icon="interviews" />
      <CounterCard label="Feedback pendiente" value={data.pendingFeedback} to="/feedback?status=pending" icon="feedback" />
    </section>
  );
}
