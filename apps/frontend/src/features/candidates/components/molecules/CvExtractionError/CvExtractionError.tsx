import { InlineNotification } from '@shared/components/molecules/InlineNotification';
import { Button } from '@shared/components/atoms/Button';

export interface CvExtractionErrorProps {
  readonly message: string;
  /** Solo cuando ICA no está disponible: reintento explícito con Clásica. */
  readonly onRetryClassic?: () => void;
}

export function CvExtractionError({ message, onRetryClassic }: CvExtractionErrorProps): JSX.Element {
  return (
    <InlineNotification kind="error" role="alert">
      <p>{message}</p>
      {onRetryClassic && <Button variant="secondary" size="sm" onClick={onRetryClassic}>Reintentar con Clásica</Button>}
    </InlineNotification>
  );
}
