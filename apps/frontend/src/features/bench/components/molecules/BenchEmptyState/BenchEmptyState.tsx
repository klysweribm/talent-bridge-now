import { ListEmptyState } from '@shared/components/molecules/ListEmptyState';
import { BENCH_COPY } from '../../../config/bench.constants';

export interface BenchEmptyStateProps {
  readonly onClear: () => void;
}

export function BenchEmptyState({ onClear }: BenchEmptyStateProps): JSX.Element {
  return <ListEmptyState message={BENCH_COPY.emptyMessage} actionLabel={BENCH_COPY.emptyAction} onAction={onClear} />;
}
