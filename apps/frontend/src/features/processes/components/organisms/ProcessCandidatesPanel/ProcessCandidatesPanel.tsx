import { useState } from 'react';
import type { IProcessDetail } from '@ibm-talent-bridge/shared-types';
import { Button } from '@shared/components/atoms/Button';
import { Pagination } from '@shared/components/molecules/Pagination';
import { PROCESS_ACTIONS_COPY } from '../../../config/processActions.copy';
import { PROCESS_LIST_COPY } from '../../../config/processList.constants';
import { CANDIDATES_STEP_TEXT } from '../../../config/processWizard.constants';
import { useDetailAvailableCandidates } from '../../../hooks/useDetailAvailableCandidates';
import { useProcessCandidateActions } from '../../../hooks/useProcessCandidateActions';
import { ActionFeedback } from '../../molecules/ActionFeedback/ActionFeedback';
import { CandidatesBody } from '../../molecules/CandidatesBody/CandidatesBody';
import { ProcessCandidateList } from '../../molecules/ProcessCandidateList/ProcessCandidateList';

export interface ProcessCandidatesPanelProps {
  readonly process: IProcessDetail;
  /** Sin permiso la lista es de solo lectura y no se consulta a los disponibles. */
  readonly canManage: boolean;
}

const COPY = PROCESS_ACTIONS_COPY.candidates;

function AddBox({ process }: { readonly process: IProcessDetail }): JSX.Element {
  const available = useDetailAvailableCandidates();
  const { add } = useProcessCandidateActions(process.id);
  const limitReached = process.candidates.length >= process.maxCandidates;
  return (
    <div className="flex flex-col gap-sm">
      <p className="text-body-md text-text-secondary">{CANDIDATES_STEP_TEXT.counter(process.candidates.length, process.maxCandidates)}</p>
      {limitReached && <p role="status" className="text-body-md text-status-warning">{COPY.limitReached(process.maxCandidates)}</p>}
      <CandidatesBody status={available.status} rows={available.rows} checkedIds={[]} lockUnchecked={limitReached || add.isPending}
        onToggle={candidate => { add.reset(); add.mutate(candidate.id); }} onRetry={available.retry} />
      {available.totalPages > 1 && <Pagination page={available.page} totalPages={available.totalPages} onPageChange={available.setPage} />}
      <ActionFeedback error={add.error?.message} success={add.isSuccess ? COPY.added : undefined} />
    </div>
  );
}

export function ProcessCandidatesPanel({ process, canManage }: ProcessCandidatesPanelProps): JSX.Element {
  const [adding, setAdding] = useState(false);
  const { remove } = useProcessCandidateActions(process.id);
  return (
    <section aria-labelledby="process-candidates-heading" className="flex flex-col gap-md">
      <div className="flex items-center justify-between gap-md">
        <h2 id="process-candidates-heading" className="text-title-md text-text-primary">{PROCESS_LIST_COPY.candidatesHeading}</h2>
        {canManage && (
          <Button type="button" variant="secondary" className="min-h-11" aria-expanded={adding} onClick={() => setAdding(open => !open)}>
            {adding ? COPY.closeAdd : COPY.add}
          </Button>
        )}
      </div>
      {canManage && adding && <AddBox process={process} />}
      <ProcessCandidateList candidates={process.candidates} onRemove={canManage ? id => { remove.reset(); remove.mutate(id); } : undefined} removeDisabled={remove.isPending} />
      <ActionFeedback error={remove.error?.message} success={remove.isSuccess ? COPY.removed : undefined} />
    </section>
  );
}
