import { InlineNotification } from '@shared/components/molecules/InlineNotification/InlineNotification';
import { Button } from '@shared/components/atoms/Button';
import { DRAFT_COPY } from '../../../config/opportunityDraft.copy';

export interface DraftErrorAlertProps {
  readonly message:  string;
  /** Sin `onRetry` no hay botón: el error viene de un archivo y el usuario elige otro. */
  readonly onRetry?: () => void;
}

export function DraftErrorAlert({ message, onRetry }: DraftErrorAlertProps): JSX.Element {
  return (
    <InlineNotification kind="error" role="alert">
      <p className="text-body text-carbon-gray-100">{message}</p>
      {onRetry && <Button type="button" variant="secondary" size="sm" onClick={onRetry}>{DRAFT_COPY.retry}</Button>}
    </InlineNotification>
  );
}
