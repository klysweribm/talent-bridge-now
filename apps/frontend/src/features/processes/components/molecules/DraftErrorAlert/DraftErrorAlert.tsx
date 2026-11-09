import { Button } from '@shared/components/atoms/Button';
import { DRAFT_COPY } from '../../../config/opportunityDraft.copy';

export interface DraftErrorAlertProps {
  readonly message:  string;
  /** Sin `onRetry` no hay botón: el error viene de un archivo y el usuario elige otro. */
  readonly onRetry?: () => void;
}

export function DraftErrorAlert({ message, onRetry }: DraftErrorAlertProps): JSX.Element {
  return (
    <div role="alert" className="flex flex-col items-start gap-sm rounded border border-status-danger bg-status-danger-bg p-md">
      <p className="text-body-md text-text-primary">{message}</p>
      {onRetry && <Button type="button" variant="secondary" onClick={onRetry}>{DRAFT_COPY.retry}</Button>}
    </div>
  );
}
