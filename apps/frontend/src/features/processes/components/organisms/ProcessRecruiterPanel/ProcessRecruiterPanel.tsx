import type { IProcessDetail } from '@ibm-talent-bridge/shared-types';
import { PROCESS_ACTIONS_COPY } from '../../../config/processActions.copy';
import { PROCESS_FIELD_IDS } from '../../../constants/processFieldIds';
import { useUpdateProcess } from '../../../hooks/useUpdateProcess';
import { useUserOptions } from '../../../hooks/useUserOptions';
import { ActionFeedback } from '../../molecules/ActionFeedback/ActionFeedback';
import { SelectField } from '../../molecules/SelectField/SelectField';

export interface ProcessRecruiterPanelProps {
  readonly process: IProcessDetail;
}

const COPY = PROCESS_ACTIONS_COPY.recruiter;

export function ProcessRecruiterPanel({ process }: ProcessRecruiterPanelProps): JSX.Element {
  const options = useUserOptions('recruiter');
  const update = useUpdateProcess(process.id);
  const error = update.error?.message ?? (options.isError ? COPY.loadError : undefined);
  return (
    <div className="flex flex-col gap-sm">
      <SelectField
        id={PROCESS_FIELD_IDS.recruiterId} label={COPY.label} placeholder={COPY.placeholder}
        options={options.data?.data ?? []} value={process.recruiterId ?? ''}
        onChange={recruiterId => { update.reset(); if (recruiterId && recruiterId !== process.recruiterId) update.mutate({ recruiterId }); }}
        onBlur={() => undefined}
      />
      <ActionFeedback error={error} success={update.isSuccess ? COPY.saved : undefined} />
    </div>
  );
}
