import { Button } from '@shared/components/atoms/Button';

export interface ListErrorStateProps {
  /** Mensaje de error mostrado en un `role="alert"`. */
  readonly message:    string;
  readonly retryLabel: string;
  readonly onRetry:    () => void;
}

export function ListErrorState({ message, retryLabel, onRetry }: ListErrorStateProps): JSX.Element {
  return (
    <div role="alert" className="flex flex-col items-center gap-md py-2xl text-center">
      <p className="text-body-lg text-status-danger">{message}</p>
      <Button variant="secondary" onClick={onRetry}>{retryLabel}</Button>
    </div>
  );
}
