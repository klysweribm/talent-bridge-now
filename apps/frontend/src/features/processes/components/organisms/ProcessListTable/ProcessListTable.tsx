import { ListEmptyState } from '@shared/components/molecules/ListEmptyState';
import { ListErrorState } from '@shared/components/molecules/ListErrorState';
import { Pagination } from '@shared/components/molecules/Pagination';
import { PROCESS_LIST_COPY, PROCESS_LIST_SKELETON_ROWS } from '../../../config/processList.constants';
import { useProcessList } from '../../../hooks/useProcessList';
import { useProcessListParams } from '../../../hooks/useProcessListParams';
import { ProcessItem } from '../../molecules/ProcessItem';
import { ProcessItemSkeleton } from '../../molecules/ProcessItemSkeleton';

export function ProcessListTable(): JSX.Element {
  const { params, setPage } = useProcessListParams();
  const { data, isError, refetch } = useProcessList(params);

  if (isError && !data) return <ListErrorState message={PROCESS_LIST_COPY.errorMessage} retryLabel={PROCESS_LIST_COPY.retryLabel} onRetry={() => void refetch()} />;
  if (data && data.data.length === 0) {
    return <ListEmptyState message={PROCESS_LIST_COPY.emptyMessage} />;
  }

  return (
    <div className="flex flex-col gap-md">
      {data ? (
        <ul className="flex flex-col gap-xs">
          {data.data.map(process => <ProcessItem key={process.id} process={process} />)}
        </ul>
      ) : (
        <ProcessItemSkeleton label={PROCESS_LIST_COPY.loadingLabel} rows={PROCESS_LIST_SKELETON_ROWS} />
      )}
      {data && <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />}
    </div>
  );
}
