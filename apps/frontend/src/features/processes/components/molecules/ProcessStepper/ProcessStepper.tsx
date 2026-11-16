import { Icon } from '@shared/components/atoms/Icon';
import { PROCESS_CREATE_STEPS, type TProcessCreateStep } from '../../../config/processCreate.constants';
import { PROCESS_STEP_LABELS, WIZARD_TEXT } from '../../../config/processWizard.constants';

export interface ProcessStepperProps {
  readonly current:    TProcessCreateStep;
  readonly onNavigate: (step: TProcessCreateStep) => void;
  /** Bloquea volver a pasos completados (p. ej. mientras se crea el proceso). */
  readonly disabled:   boolean;
}

const BASE = 'flex min-h-11 flex-col items-start gap-2xs text-body';
const ITEM = 'flex flex-col border-t-2 pt-sm';
const FOCUS = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-carbon-blue-60';

function CompletedStep({ step, disabled, onNavigate }: { readonly step: TProcessCreateStep; readonly disabled: boolean; readonly onNavigate: (step: TProcessCreateStep) => void }): JSX.Element {
  return (
    <li className={`${ITEM} border-carbon-blue-60`}>
      <button type="button" disabled={disabled} onClick={() => onNavigate(step)} className={`${BASE} ${FOCUS} text-carbon-gray-100 hover:bg-carbon-gray-hover disabled:opacity-50`}>
        <span aria-hidden="true" className="flex h-4 w-4 items-center justify-center rounded-full bg-carbon-blue-60 text-white"><Icon name="check" size={12} /></span>
        <span>{PROCESS_STEP_LABELS[step]}</span>
        <span className="sr-only">{WIZARD_TEXT.completedMark}</span>
      </button>
    </li>
  );
}

function PendingStep({ step, index, isCurrent }: { readonly step: TProcessCreateStep; readonly index: number; readonly isCurrent: boolean }): JSX.Element {
  return (
    <li aria-current={isCurrent ? 'step' : undefined} className={`${ITEM} ${isCurrent ? 'border-carbon-blue-60' : 'border-carbon-gray-50'}`}>
      <span aria-hidden="true" className={isCurrent ? 'flex h-4 w-4 items-center justify-center rounded-full border border-carbon-blue-60' : 'h-4 w-4 rounded-full border border-carbon-gray-100'}>
        {isCurrent && <span className="block h-1.5 w-1.5 rounded-full bg-carbon-blue-60" />}
      </span>
      <span className="sr-only">{index + 1}</span>
      <span className={`${BASE} min-h-0 ${isCurrent ? 'text-carbon-gray-100' : 'text-carbon-gray-70'}`}>{PROCESS_STEP_LABELS[step]}</span>
    </li>
  );
}

export function ProcessStepper({ current, onNavigate, disabled }: ProcessStepperProps): JSX.Element {
  const currentIndex = PROCESS_CREATE_STEPS.indexOf(current);
  return (
    <nav aria-label={WIZARD_TEXT.stepperLabel}>
      <ol className="grid grid-cols-1 gap-sm md:grid-cols-3">
        {PROCESS_CREATE_STEPS.map((step, index) => index < currentIndex
          ? <CompletedStep key={step} step={step} disabled={disabled} onNavigate={onNavigate} />
          : <PendingStep key={step} step={step} index={index} isCurrent={index === currentIndex} />)}
      </ol>
    </nav>
  );
}
