import type { MouseEvent } from 'react';
import { Button } from '@shared/components/atoms/Button';
import { Pagination } from '@shared/components/molecules/Pagination';
import { CANDIDATES_STEP_TEXT, WIZARD_TEXT } from '../../../config/processWizard.constants';
import { CANDIDATE_PANEL_TEXT } from '../../../config/candidatePanel.copy';
import { useAddCandidateInPanel } from '../../../hooks/useAddCandidateInPanel';
import { useCandidatesStep } from '../../../hooks/useCandidatesStep';
import { useWizardStore } from '../../../store/wizard.store';
import { AddCandidatePanel } from '../AddCandidatePanel/AddCandidatePanel';
import { CandidatesBody } from '../../molecules/CandidatesBody';
import { DismissibleNotice } from '../../molecules/DismissibleNotice/DismissibleNotice';
import { StepFooter } from '../../molecules/StepFooter';
import { StepHeading } from '../../molecules/StepHeading';

function PanelNotice({ notice, onDismiss }: { readonly notice: string | undefined; readonly onDismiss: () => void }): JSX.Element | null {
  return notice ? <DismissibleNotice message={notice} dismissLabel={CANDIDATE_PANEL_TEXT.dismissNotice} onDismiss={onDismiss} /> : null;
}

function CounterRow({ counter, onAdd }: { readonly counter: string; readonly onAdd: (event: MouseEvent<HTMLButtonElement>) => void }): JSX.Element {
  return (
    <div className="flex flex-wrap items-center justify-between gap-md">
      <p className="text-body-md text-text-secondary">{counter}</p>
      <Button type="button" variant="secondary" className="min-h-11" onClick={onAdd}>{CANDIDATES_STEP_TEXT.add}</Button>
    </div>
  );
}

export function ProcessCandidatesStep(): JSX.Element {
  const step = useCandidatesStep();
  const setStep = useWizardStore(state => state.setStep);
  const { maxCandidates } = step;
  const panel = useAddCandidateInPanel(maxCandidates);
  return (
    <div className="flex flex-col gap-lg">
      <StepHeading>{CANDIDATES_STEP_TEXT.heading}</StepHeading>
      <CounterRow counter={maxCandidates !== undefined ? CANDIDATES_STEP_TEXT.counter(step.selectedCount, maxCandidates) : ''} onAdd={panel.openFrom} />
      <PanelNotice notice={panel.notice} onDismiss={panel.dismissNotice} />
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
      {panel.open && <AddCandidatePanel onClose={panel.closePanel} onSuccess={panel.onSuccess} returnFocusTo={panel.returnFocusTo} />}
    </div>
  );
}
