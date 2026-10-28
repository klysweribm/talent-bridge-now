import { useDashboardSummaryQuery } from '../../../hooks/useDashboardSummaryQuery';
import { CounterCard } from '../../molecules/CounterCard';

export function SummaryCounters(): JSX.Element | null {
  const { data } = useDashboardSummaryQuery();
  if (!data) return null;

  return (
    <section aria-label="Resumen" className="grid grid-cols-1 sm:grid-cols-3 gap-base">
      <CounterCard label="Procesos activos" value={data.activeProcesses} to="/processes?status=active" icon="processes" />
      <CounterCard label="Entrevistas hoy" value={data.interviewsToday} to="/interviews?date=today" icon="interviews" />
      <CounterCard label="Feedback pendiente" value={data.pendingFeedback} to="/feedback?status=pending" icon="feedback" />
    </section>
  );
}
