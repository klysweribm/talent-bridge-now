import { useWizardStore } from '../../store/wizard.store';
import { WIZARD_TEXT } from '../../config/processWizard.constants';
import { ProcessStepper } from '../molecules/ProcessStepper';
import { ProcessCandidatesStep } from '../organisms/ProcessCandidatesStep';
import { ProcessConfirmStep } from '../organisms/ProcessConfirmStep';
import { ProcessDataStep } from '../organisms/ProcessDataStep';

export function NewProcessPage(): JSX.Element {
  const step = useWizardStore(state => state.step);
  const setStep = useWizardStore(state => state.setStep);

  return (
    <div className="px-base md:px-xl py-lg flex flex-col gap-lg w-full max-w-3xl mx-auto">
      <h1 className="text-headline-md text-text-primary">{WIZARD_TEXT.pageTitle}</h1>
      <ProcessStepper current={step} onNavigate={setStep} disabled={false} />
      {step === 'data' && <ProcessDataStep />}
      {step === 'candidates' && <ProcessCandidatesStep />}
      {step === 'confirm' && <ProcessConfirmStep />}
    </div>
  );
}
