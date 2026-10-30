import { Button } from '@shared/components/atoms/Button';

export interface BenchEmptyStateProps {
  readonly onClear: () => void;
}

export function BenchEmptyState({ onClear }: BenchEmptyStateProps): JSX.Element {
  return (
    <div className="flex flex-col items-center gap-md py-2xl text-center">
      <p className="text-body-lg text-text-secondary">No hay recursos que coincidan con los filtros.</p>
      <Button variant="secondary" onClick={onClear}>Limpiar filtros</Button>
    </div>
  );
}
