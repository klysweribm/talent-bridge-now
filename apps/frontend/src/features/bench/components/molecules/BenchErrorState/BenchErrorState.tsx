import { Button } from '@shared/components/atoms/Button';

export interface BenchErrorStateProps {
  readonly onRetry: () => void;
}

export function BenchErrorState({ onRetry }: BenchErrorStateProps): JSX.Element {
  return (
    <div role="alert" className="flex flex-col items-center gap-md py-2xl text-center">
      <p className="text-body-lg text-status-danger">No pudimos cargar la banca.</p>
      <Button variant="secondary" onClick={onRetry}>Reintentar</Button>
    </div>
  );
}
