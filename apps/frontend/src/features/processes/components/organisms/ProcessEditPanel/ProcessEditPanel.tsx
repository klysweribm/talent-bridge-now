import { useState } from 'react';
import type { IProcessDetail } from '@ibm-talent-bridge/shared-types';
import { Button } from '@shared/components/atoms/Button';
import { PROCESS_ACTIONS_COPY } from '../../../config/processActions.copy';
import { useProcessEditForm } from '../../../hooks/useProcessEditForm';
import { useUpdateProcess } from '../../../hooks/useUpdateProcess';
import { ActionFeedback } from '../../molecules/ActionFeedback/ActionFeedback';
import { ProcessEditFields } from '../../molecules/ProcessEditFields/ProcessEditFields';

export interface ProcessEditPanelProps {
  readonly process: IProcessDetail;
}

const COPY = PROCESS_ACTIONS_COPY.edit;

export function ProcessEditPanel({ process }: ProcessEditPanelProps): JSX.Element {
  const [editing, setEditing] = useState(false);
  const update = useUpdateProcess(process.id);
  const form = useProcessEditForm({ title: process.title, clientName: process.clientName }, values => {
    update.mutate(values, { onSuccess: () => setEditing(false) });
  });
  const close = (): void => { update.reset(); setEditing(false); };

  return (
    <div className="flex flex-col gap-sm">
      {editing
        ? <ProcessEditFields form={form} busy={update.isPending} onSubmit={form.onSubmit} onCancel={close} />
        : <Button type="button" variant="secondary" className="min-h-11 self-start" onClick={() => { update.reset(); setEditing(true); }}>{COPY.open}</Button>}
      <ActionFeedback error={update.error?.message} success={!editing && update.isSuccess ? COPY.saved : undefined} />
    </div>
  );
}
