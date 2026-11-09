import { Button } from '@shared/components/atoms/Button';

export interface DismissibleNoticeProps {
  readonly message:      string;
  readonly dismissLabel: string;
  readonly onDismiss:    () => void;
}

/** Aviso persistente (role="status"): solo desaparece al pulsar el botón. */
export function DismissibleNotice({ message, dismissLabel, onDismiss }: DismissibleNoticeProps): JSX.Element {
  return (
    <div role="status" className="flex items-center justify-between gap-md rounded border border-status-success bg-status-success-bg p-md text-body-md text-status-success-text">
      <span>{message}</span>
      <Button type="button" variant="ghost" size="sm" onClick={onDismiss}>{dismissLabel}</Button>
    </div>
  );
}
