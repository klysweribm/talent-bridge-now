import { BENCH_COLUMNS, SKELETON_ROWS } from '../../../config/bench.constants';

export interface BenchTableSkeletonProps {
  readonly rows?: number;
}

export function BenchTableSkeleton({ rows = SKELETON_ROWS }: BenchTableSkeletonProps): JSX.Element {
  return (
    <tbody role="status" aria-label="Cargando banca">
      {Array.from({ length: rows }, (_, index) => (
        <tr key={index} className="h-14 border-b border-outline-variant">
          <td colSpan={BENCH_COLUMNS.length} className="px-base">
            <div className="h-4 rounded bg-surface-high animate-pulse" />
          </td>
        </tr>
      ))}
    </tbody>
  );
}
