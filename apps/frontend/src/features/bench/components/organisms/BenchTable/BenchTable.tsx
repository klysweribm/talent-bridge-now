import { BENCH_COLUMNS } from '../../../config/bench.constants';
import { useBenchFilters } from '../../../hooks/useBenchFilters';
import { useBenchList } from '../../../hooks/useBenchList';
import { toBenchQuery } from '../../../utils/toBenchQuery';
import { BenchEmptyState } from '../../molecules/BenchEmptyState';
import { BenchErrorState } from '../../molecules/BenchErrorState';
import { BenchTableRow } from '../../molecules/BenchTableRow';
import { BenchTableSkeleton } from '../../molecules/BenchTableSkeleton';
import { TABLE_CLASSES, TABLE_HEAD_CELL, TABLE_HEAD_ROW } from '@shared/components/table.constants';
import { Pagination } from '@shared/components/molecules/Pagination';

export interface BenchTableProps {
  readonly onSelect: (benchCode: string) => void;
  readonly selectedCode?: string | null;
}

export function BenchTable({ onSelect, selectedCode }: BenchTableProps): JSX.Element {
  const { filters, setPage, clearFilters } = useBenchFilters();
  const { data, isPending, isError, refetch } = useBenchList(toBenchQuery(filters));

  if (isError && !data) return <BenchErrorState onRetry={() => void refetch()} />;
  if (data && data.data.length === 0) return <BenchEmptyState onClear={clearFilters} />;

  return (
    <div className="flex flex-col gap-md">
      <div className="overflow-x-auto bg-white">
        <table className={`${TABLE_CLASSES} min-w-[880px]`}>
          <thead>
            <tr className={TABLE_HEAD_ROW}>
              {BENCH_COLUMNS.map(column => (
                <th key={column} scope="col" className={TABLE_HEAD_CELL}>{column}</th>
              ))}
            </tr>
          </thead>
          {isPending || !data ? <BenchTableSkeleton /> : (
            <tbody>
              {data.data.map(resource => (
                <BenchTableRow key={resource.id} resource={resource} selected={resource.benchCode === selectedCode} onSelect={onSelect} />
              ))}
            </tbody>
          )}
        </table>
      </div>
      {data && <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />}
    </div>
  );
}
