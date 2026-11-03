import { Button } from '@shared/components/atoms/Button';

export interface ErrorBannerProps {
  readonly message:      string;
  /** Sin `actionLabel`/`onAction` no se muestra botón. */
  readonly actionLabel?: string;
  readonly onAction?:    () => void;
}

export function ErrorBanner({ message, actionLabel, onAction }: ErrorBannerProps): JSX.Element {
  return (
    <div role="alert" className="flex items-center justify-between gap-md p-md rounded border border-status-danger bg-status-danger-bg text-body-md text-status-danger">
      <span>{message}</span>
      {actionLabel && onAction && <Button type="button" variant="secondary" size="sm" onClick={onAction}>{actionLabel}</Button>}
    </div>
  );
}
