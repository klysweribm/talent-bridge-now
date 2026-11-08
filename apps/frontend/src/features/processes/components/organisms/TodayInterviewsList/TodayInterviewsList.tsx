import { DASHBOARD_COPY } from '../../../config/dashboard.copy';
import { DashboardSection } from '../../molecules/DashboardSection';
import { EmptyMessage } from '../../molecules/EmptyMessage';

// Sin capability de entrevistas: estado vacío honesto, no "No hay entrevistas hoy".
export function TodayInterviewsList(): JSX.Element {
  return (
    <DashboardSection title={DASHBOARD_COPY.todayTitle} headingId="today-interviews-heading">
      <EmptyMessage text={DASHBOARD_COPY.todayEmpty} />
    </DashboardSection>
  );
}
