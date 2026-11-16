import { PROCESSES_PATH } from '@/router/paths';
import { DASHBOARD_COPY, DASHBOARD_PATHS } from '../../../config/dashboard.copy';
import { PROCESS_LIST_COPY } from '../../../config/processList.constants';
import { useCanSeeProcesses } from '../../../hooks/useCanSeeProcesses';
import { useProcessTotal } from '../../../hooks/useProcessTotal';
import { KpiStrip } from '@shared/components/molecules/KpiStrip';
import { CounterCard } from '../../molecules/CounterCard';

export function SummaryCounters(): JSX.Element {
  const canSee = useCanSeeProcesses();
  const total = useProcessTotal(canSee);

  const processesValue = total.isError ? PROCESS_LIST_COPY.counterError
    : total.data ? total.data.total : PROCESS_LIST_COPY.counterLoading;

  return (
    <section aria-label={DASHBOARD_COPY.summaryLabel}>
      <KpiStrip>
      {canSee && <CounterCard label={PROCESS_LIST_COPY.activeTitle} value={processesValue} to={PROCESSES_PATH} icon="processes" />}
      {/* Sin capability de entrevistas/feedback: nunca 0, que afirmaría un dato que no se tiene. */}
      <CounterCard label={DASHBOARD_COPY.interviewsToday} value={DASHBOARD_COPY.noValue} hint={DASHBOARD_COPY.comingSoon} to={DASHBOARD_PATHS.interviewsToday} icon="interviews" />
      <CounterCard label={DASHBOARD_COPY.pendingFeedback} value={DASHBOARD_COPY.noValue} hint={DASHBOARD_COPY.comingSoon} to={DASHBOARD_PATHS.pendingFeedback} icon="feedback" />
      </KpiStrip>
    </section>
  );
}
