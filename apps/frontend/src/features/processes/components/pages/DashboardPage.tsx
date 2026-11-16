import { useNavigate } from 'react-router-dom';
import { Button } from '@shared/components/atoms/Button';
import { CANDIDATES_NEW_PATH, NEW_PROCESS_PATH } from '@/router/paths';
import { DASHBOARD_COPY } from '../../config/dashboard.copy';
import { useCanSeeProcesses } from '../../hooks/useCanSeeProcesses';
import { ActiveProcessesList } from '../organisms/ActiveProcessesList';
import { AttentionList } from '../organisms/AttentionList';
import { SummaryCounters } from '../organisms/SummaryCounters';
import { TodayInterviewsList } from '../organisms/TodayInterviewsList';

export function DashboardPage(): JSX.Element {
  const navigate = useNavigate();
  const canSee = useCanSeeProcesses();

  return (
    <div className="px-xl pt-lg pb-3xl flex flex-col gap-lg w-full max-w-content-max mx-auto">
      <header className="flex flex-wrap items-center justify-between gap-md">
        <h1 className="text-h1 text-carbon-gray-100">{DASHBOARD_COPY.title}</h1>
        {canSee && (
          <div className="flex gap-px">
            <Button variant="secondary" size="lg" icon="add" onClick={() => navigate(NEW_PROCESS_PATH)}>{DASHBOARD_COPY.newProcess}</Button>
            <Button size="lg" icon="person_add" onClick={() => navigate(CANDIDATES_NEW_PATH)}>{DASHBOARD_COPY.addCandidate}</Button>
          </div>
        )}
      </header>
      <SummaryCounters />
      <div className="grid grid-cols-1 gap-lg">
        <ActiveProcessesList />
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(360px,1fr))] gap-lg items-start">
        <AttentionList />
        <TodayInterviewsList />
      </div>
    </div>
  );
}
