import { Button } from '@shared/components/atoms/Button';
import { CONFIRM_STEP_TEXT, WIZARD_TEXT } from '../../../config/processWizard.constants';
import { useConfirmStep } from '../../../hooks/useConfirmStep';
import { useWizardStore } from '../../../store/wizard.store';
import { ConfirmSummary } from '../../molecules/ConfirmSummary';
import { ErrorBanner } from '../../molecules/ErrorBanner';
import { StepFooter } from '../../molecules/StepFooter';
import { StepHeading } from '../../molecules/StepHeading';

export function ProcessConfirmStep(): JSX.Element {
  const { data, candidates, setStep } = useWizardStore();
  const confirm = useConfirmStep();
  const { busy } = confirm;
  return (
    <div className="flex flex-col gap-lg">
      <StepHeading>{CONFIRM_STEP_TEXT.heading}</StepHeading>
      {confirm.errorMessage !== null && (
        <ErrorBanner message={confirm.errorMessage || CONFIRM_STEP_TEXT.genericError} actionLabel={confirm.canRetry ? WIZARD_TEXT.retry : undefined} onAction={confirm.submit} />
      )}
      <ConfirmSummary
        title={data.title}
        clientName={data.clientName}
        userLabel={confirm.isRecruiter ? CONFIRM_STEP_TEXT.pmLabel : CONFIRM_STEP_TEXT.recruiterLabel}
        userName={confirm.userName}
        candidates={candidates}
        disabled={busy}
        onEditData={() => setStep('data')}
        onEditCandidates={() => setStep('candidates')}
      />
      <StepFooter backLabel={WIZARD_TEXT.back} onBack={() => setStep('candidates')} disabled={busy}>
        <Button type="button" variant="ghost" className="min-h-11" disabled={busy} onClick={confirm.discard}>{CONFIRM_STEP_TEXT.cancel}</Button>
        <Button type="button" className="min-h-11" disabled={busy} onClick={confirm.submit}>
          {busy ? CONFIRM_STEP_TEXT.creating : CONFIRM_STEP_TEXT.create}
        </Button>
      </StepFooter>
    </div>
  );
}
