import { ListErrorState } from '@shared/components/molecules/ListErrorState';
import { BENCH_COPY } from '../../../config/bench.constants';

export interface BenchErrorStateProps {
  readonly onRetry: () => void;
}

export function BenchErrorState({ onRetry }: BenchErrorStateProps): JSX.Element {
  return <ListErrorState message={BENCH_COPY.errorMessage} retryLabel={BENCH_COPY.retryLabel} onRetry={onRetry} />;
}
