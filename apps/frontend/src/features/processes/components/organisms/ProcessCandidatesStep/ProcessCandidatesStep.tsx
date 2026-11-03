import { Link } from 'react-router-dom';
import { Button } from '@shared/components/atoms/Button';
import { Pagination } from '@shared/components/molecules/Pagination';
import { CANDIDATES_NEW_PATH } from '@/router/paths';
import { NEW_PROCESS_ORIGIN } from '@features/candidates/config/candidateList.constants';
import type { ICandidateNavState } from '@features/candidates/types/candidateList.types';
import { CANDIDATES_STEP_TEXT, WIZARD_TEXT } from '../../../config/processWizard.constants';
import { useCandidatesStep } from '../../../hooks/useCandidatesStep';
import { useWizardStore } from '../../../store/wizard.store';
import { CandidatesBody } from '../../molecules/CandidatesBody';
import { StepFooter } from '../../molecules/StepFooter';
import { StepHeading } from '../../molecules/StepHeading';

const ADD_LINK_STATE: ICandidateNavState = { from: NEW_PROCESS_ORIGIN };
const ADD_LINK_CLASSES = 'inline-flex items-center justify-center min-h-11 px-base rounded border border-primary-interactive text-primary-interactive text-body-md-medium';

export function ProcessCandidatesStep(): JSX.Element {
  const step = useCandidatesStep();
  const setStep = useWizardStore(state => state.setStep);
  const { maxCandidates } = step;
  return (
    <div className="flex flex-col gap-lg">
      <StepHeading>{CANDIDATES_STEP_TEXT.heading}</StepHeading>
      <div className="flex flex-wrap items-center justify-between gap-md">
        <p className="text-body-md text-text-secondary">
          {maxCandidates !== undefined && CANDIDATES_STEP_TEXT.counter(step.selectedCount, maxCandidates)}
        </p>
        <Link to={CANDIDATES_NEW_PATH} state={ADD_LINK_STATE} className={ADD_LINK_CLASSES}>{CANDIDATES_STEP_TEXT.add}</Link>
      </div>
      {step.limitReached && maxCandidates !== undefined && <p role="status" className="text-body-md text-status-warning">{CANDIDATES_STEP_TEXT.limitReached(maxCandidates)}</p>}
      <CandidatesBody
        status={step.status}
        rows={step.rows}
        checkedIds={step.checkedIds}
        lockUnchecked={step.limitReached || maxCandidates === undefined}
        onToggle={step.toggle}
        onRetry={step.retry}
      />
      {step.totalPages > 1 && <Pagination page={step.page} totalPages={step.totalPages} onPageChange={step.setPage} />}
      <StepFooter backLabel={WIZARD_TEXT.back} onBack={() => setStep('data')}>
        <Button type="button" className="min-h-11" onClick={() => setStep('confirm')}>{WIZARD_TEXT.next}</Button>
      </StepFooter>
    </div>
  );
}
