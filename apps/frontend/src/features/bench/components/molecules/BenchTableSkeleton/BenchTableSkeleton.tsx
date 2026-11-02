import { TableSkeleton } from '@shared/components/molecules/TableSkeleton';
import { BENCH_COLUMNS, BENCH_COPY, SKELETON_ROWS } from '../../../config/bench.constants';

export interface BenchTableSkeletonProps {
  readonly rows?: number;
}

export function BenchTableSkeleton({ rows = SKELETON_ROWS }: BenchTableSkeletonProps): JSX.Element {
  return <TableSkeleton label={BENCH_COPY.loadingLabel} columnCount={BENCH_COLUMNS.length} rows={rows} />;
}
