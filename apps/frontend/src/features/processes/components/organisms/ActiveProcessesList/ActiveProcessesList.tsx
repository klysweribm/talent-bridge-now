import { ListErrorState } from '@shared/components/molecules/ListErrorState';
import { PROCESSES_PATH } from '@/router/paths';
import {
  ACTIVE_PROCESSES_LIMIT, PROCESS_LIST_COPY, PROCESS_LIST_SKELETON_ROWS,
} from '../../../config/processList.constants';
import { useCanSeeProcesses } from '../../../hooks/useCanSeeProcesses';
import { useProcessList } from '../../../hooks/useProcessList';
import { DashboardSection } from '../../molecules/DashboardSection';
import { EmptyMessage } from '../../molecules/EmptyMessage';
import { ProcessItem } from '../../molecules/ProcessItem';
import { ProcessItemSkeleton } from '../../molecules/ProcessItemSkeleton';

export { ACTIVE_PROCESSES_LIMIT };

const PARAMS = { limit: ACTIVE_PROCESSES_LIMIT } as const;

export function ActiveProcessesList(): JSX.Element | null {
  const canSee = useCanSeeProcesses();
  const { data, isError, refetch } = useProcessList(PARAMS, { enabled: canSee });
  if (!canSee) return null;

  const seeAll = data && data.total > ACTIVE_PROCESSES_LIMIT
    ? { to: PROCESSES_PATH, label: PROCESS_LIST_COPY.seeAll }
    : undefined;

  return (
    <DashboardSection title={PROCESS_LIST_COPY.activeTitle} headingId="active-processes-heading" seeAll={seeAll}>
      {isError && !data ? (
        <ListErrorState message={PROCESS_LIST_COPY.errorMessage} retryLabel={PROCESS_LIST_COPY.retryLabel} onRetry={() => void refetch()} />
      ) : !data ? (
        <ProcessItemSkeleton label={PROCESS_LIST_COPY.loadingLabel} rows={PROCESS_LIST_SKELETON_ROWS} />
      ) : data.data.length === 0 ? (
        <EmptyMessage text={PROCESS_LIST_COPY.activeEmpty} action={{ to: `${PROCESSES_PATH}/new`, label: PROCESS_LIST_COPY.createFirst }} />
      ) : (
        <ul className="flex flex-col gap-xs">
          {data.data.map(process => <ProcessItem key={process.id} process={process} />)}
        </ul>
      )}
    </DashboardSection>
  );
}
