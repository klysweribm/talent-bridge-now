import { ListEmptyState } from '@shared/components/molecules/ListEmptyState';
import { ListErrorState } from '@shared/components/molecules/ListErrorState';
import { Pagination } from '@shared/components/molecules/Pagination';
import { Button } from '@shared/components/atoms/Button';
import type { IProcessListItem, PaginatedResponse } from '@ibm-talent-bridge/shared-types';
import {
  PROCESS_LIST_COPY, PROCESS_LIST_SKELETON_ROWS, formatNoResults,
} from '../../../config/processList.constants';
import { useProcessList } from '../../../hooks/useProcessList';
import { useProcessListParams } from '../../../hooks/useProcessListParams';
import { useProcessSearch } from '../../../hooks/useProcessSearch';
import { ProcessItem } from '../../molecules/ProcessItem';
import { ProcessItemSkeleton } from '../../molecules/ProcessItemSkeleton';
import { ProcessListHeader } from '../../molecules/ProcessListHeader/ProcessListHeader';

const HEADING_ID = 'process-list-heading';

interface IBodyProps {
  readonly data:     PaginatedResponse<IProcessListItem> | undefined;
  readonly isError:  boolean;
  readonly q:        string | undefined;
  readonly onRetry:  () => void;
  readonly onClear:  () => void;
  readonly onPage:   (page: number) => void;
}

function ProcessListBody({ data, isError, q, onRetry, onClear, onPage }: IBodyProps): JSX.Element {
  if (isError && !data) return <ListErrorState message={PROCESS_LIST_COPY.errorMessage} retryLabel={PROCESS_LIST_COPY.retryLabel} onRetry={onRetry} />;
  if (!data) return <ProcessItemSkeleton label={PROCESS_LIST_COPY.loadingLabel} rows={PROCESS_LIST_SKELETON_ROWS} />;
  if (data.data.length === 0 && q) {
    return (
      <ListEmptyState message={formatNoResults(q)}>
        <Button variant="secondary" onClick={onClear}>{PROCESS_LIST_COPY.clearFilter}</Button>
      </ListEmptyState>
    );
  }
  if (data.data.length === 0) return <ListEmptyState message={PROCESS_LIST_COPY.emptyMessage} />;
  return (
    <>
      <ul className="flex flex-col">
        {data.data.map(process => <ProcessItem key={process.id} process={process} />)}
      </ul>
      <Pagination page={data.page} totalPages={data.totalPages} onPageChange={onPage} />
    </>
  );
}

export function ProcessListTable(): JSX.Element {
  const { params, setPage, setQuery } = useProcessListParams();
  const { draft, setDraft, clear } = useProcessSearch(params.q, setQuery);
  const { data, isError, refetch } = useProcessList(params);

  return (
    <section aria-labelledby={HEADING_ID} className="bg-surface-card border border-surface-high rounded-xl shadow-raised p-base flex flex-col gap-base">
      <ProcessListHeader headingId={HEADING_ID} total={data?.total} query={draft} onQueryChange={setDraft} onClear={clear} />
      <ProcessListBody data={data} isError={isError} q={params.q} onRetry={() => void refetch()} onClear={clear} onPage={setPage} />
    </section>
  );
}
