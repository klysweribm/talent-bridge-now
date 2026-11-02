import { Icon } from '@shared/components/atoms/Icon';
import { PROCESS_CREATE_STEPS, type TProcessCreateStep } from '../../../config/processCreate.constants';
import { PROCESS_STEP_LABELS, WIZARD_TEXT } from '../../../config/processWizard.constants';

export interface ProcessStepperProps {
  readonly current:    TProcessCreateStep;
  readonly onNavigate: (step: TProcessCreateStep) => void;
  /** Bloquea volver a pasos completados (p. ej. mientras se crea el proceso). */
  readonly disabled:   boolean;
}

const BASE = 'flex items-center gap-sm text-body-md min-h-11';

function CompletedStep({ step, disabled, onNavigate }: { readonly step: TProcessCreateStep; readonly disabled: boolean; readonly onNavigate: (step: TProcessCreateStep) => void }): JSX.Element {
  return (
    <li>
      <button type="button" disabled={disabled} onClick={() => onNavigate(step)} className={`${BASE} text-primary-interactive disabled:opacity-50`}>
        <Icon name="check" size={16} />
        <span>{PROCESS_STEP_LABELS[step]}</span>
        <span className="sr-only">{WIZARD_TEXT.completedMark}</span>
      </button>
    </li>
  );
}

function PendingStep({ step, index, isCurrent }: { readonly step: TProcessCreateStep; readonly index: number; readonly isCurrent: boolean }): JSX.Element {
  return (
    <li aria-current={isCurrent ? 'step' : undefined} className={`${BASE} ${isCurrent ? 'font-medium text-text-primary' : 'text-text-secondary'}`}>
      <span aria-hidden="true">{index + 1}</span>
      <span>{PROCESS_STEP_LABELS[step]}</span>
    </li>
  );
}

export function ProcessStepper({ current, onNavigate, disabled }: ProcessStepperProps): JSX.Element {
  const currentIndex = PROCESS_CREATE_STEPS.indexOf(current);
  return (
    <nav aria-label={WIZARD_TEXT.stepperLabel}>
      <ol className="flex flex-col md:flex-row gap-sm md:gap-lg">
        {PROCESS_CREATE_STEPS.map((step, index) => index < currentIndex
          ? <CompletedStep key={step} step={step} disabled={disabled} onNavigate={onNavigate} />
          : <PendingStep key={step} step={step} index={index} isCurrent={index === currentIndex} />)}
      </ol>
    </nav>
  );
}
