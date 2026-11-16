import { Button } from '@shared/components/atoms/Button';
import { InlineNotification } from '@shared/components/molecules/InlineNotification';

export interface ErrorBannerProps {
  readonly message:      string;
  /** Sin `actionLabel`/`onAction` no se muestra botón. */
  readonly actionLabel?: string;
  readonly onAction?:    () => void;
}

export function ErrorBanner({ message, actionLabel, onAction }: ErrorBannerProps): JSX.Element {
  return (
    <InlineNotification kind="error" role="alert">
      <span>{message}</span>
      {actionLabel && onAction && <Button type="button" variant="secondary" size="sm" onClick={onAction}>{actionLabel}</Button>}
    </InlineNotification>
  );
}
