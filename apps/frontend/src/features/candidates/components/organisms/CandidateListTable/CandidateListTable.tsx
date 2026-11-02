import { ListEmptyState } from '@shared/components/molecules/ListEmptyState';
import { ListErrorState } from '@shared/components/molecules/ListErrorState';
import { Pagination } from '@shared/components/molecules/Pagination';
import { CANDIDATE_FILTERS, CANDIDATE_LIST_COPY } from '../../../config/candidateList.constants';
import { useCandidateList } from '../../../hooks/useCandidateList';
import { useCandidateListParams } from '../../../hooks/useCandidateListParams';
import { CandidateFilter } from '../../molecules/CandidateFilter/CandidateFilter';
import { CandidateTable } from '../../molecules/CandidateTable/CandidateTable';

export function CandidateListTable(): JSX.Element {
  const { params, setPage, setAssignment } = useCandidateListParams();
  const { data, isPending, isError, refetch } = useCandidateList(params);
  const emptyMessage = (CANDIDATE_FILTERS.find(option => option.value === params.assignment) ?? CANDIDATE_FILTERS[0]).empty;
  const filter = <CandidateFilter value={params.assignment} onChange={setAssignment} />;

  if (isError && !data) {
    return <div className="flex flex-col gap-md">{filter}<ListErrorState message={CANDIDATE_LIST_COPY.errorMessage} retryLabel={CANDIDATE_LIST_COPY.retryLabel} onRetry={() => void refetch()} /></div>;
  }
  if (data && data.data.length === 0) {
    return <div className="flex flex-col gap-md">{filter}<ListEmptyState message={emptyMessage} /></div>;
  }

  return (
    <div className="flex flex-col gap-md">
      {filter}
      <CandidateTable rows={isPending ? undefined : data?.data} />
      {data && <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />}
    </div>
  );
}
