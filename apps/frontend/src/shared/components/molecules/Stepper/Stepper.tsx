import { Icon } from '@shared/components/atoms/Icon';

export interface IStepperStep {
  readonly id:        string;
  readonly label:     string;
  readonly sublabel?: string;
}

export interface StepperProps {
  readonly steps:        readonly IStepperStep[];
  /** Índice (0-based) del paso actual; los anteriores se muestran hechos. */
  readonly currentIndex: number;
  readonly ariaLabel:    string;
  /** Texto solo para lectores en pasos completados. */
  readonly doneLabel?:   string;
}

function StepMarker({ state }: { readonly state: 'done' | 'current' | 'pending' }): JSX.Element {
  if (state === 'done') {
    return <span aria-hidden="true" className="flex h-4 w-4 items-center justify-center rounded-full bg-carbon-blue-60 text-white"><Icon name="check" size={12} /></span>;
  }
  if (state === 'current') {
    return <span aria-hidden="true" className="flex h-4 w-4 items-center justify-center rounded-full border border-carbon-blue-60"><span className="h-1.5 w-1.5 rounded-full bg-carbon-blue-60" /></span>;
  }
  return <span aria-hidden="true" className="h-4 w-4 rounded-full border border-carbon-gray-100" />;
}

/** Stepper horizontal del prototipo: una columna por paso con línea superior de 2px. */
export function Stepper({ steps, currentIndex, ariaLabel, doneLabel }: StepperProps): JSX.Element {
  return (
    <nav aria-label={ariaLabel}>
      <ol className="grid gap-sm" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
        {steps.map((step, index) => {
          const state = index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'pending';
          return (
            <li
              key={step.id}
              aria-current={state === 'current' ? 'step' : undefined}
              className={`flex flex-col gap-2xs border-t-2 pt-sm ${index <= currentIndex ? 'border-carbon-blue-60' : 'border-carbon-gray-50'}`}
            >
              <StepMarker state={state} />
              <span className={`text-body ${index <= currentIndex ? 'text-carbon-gray-100' : 'text-carbon-gray-70'}`}>{step.label}</span>
              {state === 'done' && doneLabel && <span className="sr-only">{doneLabel}</span>}
              {step.sublabel && <span className="text-label text-carbon-gray-60">{step.sublabel}</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
