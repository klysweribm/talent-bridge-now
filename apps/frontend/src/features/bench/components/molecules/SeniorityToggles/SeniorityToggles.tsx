import type { TSeniority } from '@ibm-talent-bridge/shared-types';
import { SENIORITY_OPTIONS } from '../../../config/bench.constants';

export interface SeniorityTogglesProps {
  readonly selected: readonly TSeniority[];
  readonly onChange: (seniority: readonly TSeniority[]) => void;
}

export function SeniorityToggles({ selected, onChange }: SeniorityTogglesProps): JSX.Element {
  const toggle = (value: TSeniority): void =>
    onChange(selected.includes(value) ? selected.filter(item => item !== value) : [...selected, value]);

  return (
    <fieldset className="flex flex-col gap-xs">
      <legend className="text-label-md text-text-secondary mb-xs">Seniority</legend>
      <div className="flex gap-xs">
        {SENIORITY_OPTIONS.map(({ value, label }) => {
          const pressed = selected.includes(value);
          return (
            <button
              key={value}
              type="button"
              aria-pressed={pressed}
              onClick={() => toggle(value)}
              className={`h-10 px-md rounded border text-body-md ${
                pressed
                  ? 'bg-primary-interactive text-white border-primary-interactive'
                  : 'bg-surface-card text-text-primary border-outline-variant'}`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
