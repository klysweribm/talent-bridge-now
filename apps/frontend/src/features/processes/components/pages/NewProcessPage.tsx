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
    <div className="px-xl pt-lg pb-3xl flex flex-col gap-lg w-full max-w-content-narrow mx-auto">
      <h1 className="text-h1 text-carbon-gray-100">{WIZARD_TEXT.pageTitle}</h1>
      <ProcessStepper current={step} onNavigate={setStep} disabled={false} />
      {step === 'data' && <ProcessDataStep />}
      {step === 'candidates' && <ProcessCandidatesStep />}
      {step === 'confirm' && <ProcessConfirmStep />}
    </div>
  );
}
