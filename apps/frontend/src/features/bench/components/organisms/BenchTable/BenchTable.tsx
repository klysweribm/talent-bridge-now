import { BENCH_COLUMNS } from '../../../config/bench.constants';
import { useBenchFilters } from '../../../hooks/useBenchFilters';
import { useBenchList } from '../../../hooks/useBenchList';
import { toBenchQuery } from '../../../utils/toBenchQuery';
import { BenchEmptyState } from '../../molecules/BenchEmptyState';
import { BenchErrorState } from '../../molecules/BenchErrorState';
import { BenchTableRow } from '../../molecules/BenchTableRow';
import { BenchTableSkeleton } from '../../molecules/BenchTableSkeleton';
import { Pagination } from '../../molecules/Pagination';

export interface BenchTableProps {
  readonly onSelect: (benchCode: string) => void;
}

export function BenchTable({ onSelect }: BenchTableProps): JSX.Element {
  const { filters, setPage, clearFilters } = useBenchFilters();
  const { data, isPending, isError, refetch } = useBenchList(toBenchQuery(filters));

  if (isError && !data) return <BenchErrorState onRetry={() => void refetch()} />;
  if (data && data.data.length === 0) return <BenchEmptyState onClear={clearFilters} />;

  return (
    <div className="flex flex-col gap-md">
      <div className="overflow-x-auto bg-surface-card border border-outline-variant rounded-lg">
        <table className="w-full text-left">
          <thead>
            <tr className="h-10 border-b border-outline-variant">
              {BENCH_COLUMNS.map(column => (
                <th key={column} scope="col" className="px-base text-label-md text-text-secondary">{column}</th>
              ))}
            </tr>
          </thead>
          {isPending || !data ? <BenchTableSkeleton /> : (
            <tbody>
              {data.data.map(resource => (
                <BenchTableRow key={resource.id} resource={resource} onSelect={onSelect} />
              ))}
            </tbody>
          )}
        </table>
      </div>
      {data && <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />}
    </div>
  );
}
