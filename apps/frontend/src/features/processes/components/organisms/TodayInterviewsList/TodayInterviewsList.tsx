import { useTodayInterviewsQuery } from '../../../hooks/useTodayInterviewsQuery';
import { DashboardSection } from '../../molecules/DashboardSection';
import { EmptyMessage } from '../../molecules/EmptyMessage';
import { TodayInterviewRow } from '../../molecules/TodayInterviewRow';

export function TodayInterviewsList(): JSX.Element | null {
  const { data } = useTodayInterviewsQuery();
  if (!data) return null;

  return (
    <DashboardSection
      title="Entrevistas de hoy"
      headingId="today-interviews-heading"
      seeAll={{ to: '/interviews?date=today', label: 'Ver todas' }}
    >
      {data.length === 0 ? (
        <EmptyMessage text="No hay entrevistas hoy." action={{ to: '/interviews', label: 'Ver agenda' }} />
      ) : (
        <ul className="flex flex-col gap-xs">
          {data.map(interview => <TodayInterviewRow key={interview.id} interview={interview} />)}
        </ul>
      )}
    </DashboardSection>
  );
}
