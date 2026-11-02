import { Button } from '@shared/components/atoms/Button';

export interface CvExtractionErrorProps {
  readonly message: string;
  /** Solo cuando ICA no está disponible: reintento explícito con Clásica. */
  readonly onRetryClassic?: () => void;
}

export function CvExtractionError({ message, onRetryClassic }: CvExtractionErrorProps): JSX.Element {
  return (
    <div role="alert" className="flex flex-col items-start gap-sm p-md rounded border border-status-danger bg-status-danger-bg">
      <p className="text-body-md text-text-primary">{message}</p>
      {onRetryClassic && <Button variant="secondary" onClick={onRetryClassic}>Reintentar con Clásica</Button>}
    </div>
  );
}
