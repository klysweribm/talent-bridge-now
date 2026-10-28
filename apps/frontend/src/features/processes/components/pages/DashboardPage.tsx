import { useNavigate } from 'react-router-dom';
import { Button } from '@shared/components/atoms/Button';
import { ActiveProcessesList } from '../organisms/ActiveProcessesList';
import { AttentionList } from '../organisms/AttentionList';
import { SummaryCounters } from '../organisms/SummaryCounters';
import { TodayInterviewsList } from '../organisms/TodayInterviewsList';

export function DashboardPage(): JSX.Element {
  const navigate = useNavigate();

  return (
    <div className="px-xl py-lg flex flex-col gap-lg w-full max-w-7xl mx-auto">
      <header className="flex items-center justify-between gap-md">
        <h1 className="text-headline-md text-text-primary">Inicio</h1>
        <Button icon="add" onClick={() => navigate('/processes/new')}>Nuevo Proceso</Button>
      </header>
      <SummaryCounters />
      <AttentionList />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg items-start">
        <ActiveProcessesList />
        <TodayInterviewsList />
      </div>
    </div>
  );
}
