import { useState } from 'react';
import type { IProcessDetail, TProcessStatus } from '@ibm-talent-bridge/shared-types';
import { TERMINAL_PROCESS_STATUSES } from '@/config/processStatus';
import { Button } from '@shared/components/atoms/Button';
import { PROCESS_ACTIONS_COPY, TERMINAL_CONFIRM_COPY } from '../../../config/processActions.copy';
import { useUpdateProcess } from '../../../hooks/useUpdateProcess';
import { ActionFeedback } from '../../molecules/ActionFeedback/ActionFeedback';
import { ConfirmPanel } from '../../molecules/ConfirmPanel/ConfirmPanel';
import { StatusSelect } from '../../molecules/StatusSelect/StatusSelect';

export interface ProcessStatusPanelProps {
  readonly process: IProcessDetail;
}

const COPY = PROCESS_ACTIONS_COPY.status;
const STATUS_SELECT_ID = 'process-status';

export function ProcessStatusPanel({ process }: ProcessStatusPanelProps): JSX.Element {
  const [pending, setPending] = useState<TProcessStatus | null>(null);
  const update = useUpdateProcess(process.id);
  const confirmCopy = pending ? TERMINAL_CONFIRM_COPY[pending] : undefined;

  const request = (status: TProcessStatus): void => {
    update.reset();
    if (status === process.status) return;
    if (TERMINAL_PROCESS_STATUSES.includes(status)) setPending(status);
    else update.mutate({ status });
  };
  const confirm = (): void => {
    if (pending) update.mutate({ status: pending }, { onSettled: () => setPending(null) });
  };

  return (
    <div className="flex flex-col gap-sm">
      <div className="flex flex-wrap items-end gap-md">
        <StatusSelect id={STATUS_SELECT_ID} label={COPY.label} value={process.status} disabled={update.isPending} onChange={request} />
        <Button type="button" variant="danger" className="min-h-11" disabled={update.isPending} onClick={() => request('cancelled')}>{COPY.remove}</Button>
      </div>
      {pending && confirmCopy && (
        <ConfirmPanel
          title={confirmCopy.title} message={confirmCopy.message} confirmLabel={confirmCopy.confirm}
          cancelLabel={COPY.keep} busyLabel={COPY.working} busy={update.isPending}
          onConfirm={confirm} onCancel={() => setPending(null)}
        />
      )}
      <ActionFeedback error={update.error?.message} success={update.isSuccess ? COPY.saved : undefined} />
    </div>
  );
}
