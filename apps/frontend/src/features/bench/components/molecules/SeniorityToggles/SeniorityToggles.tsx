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
      <legend className="text-label text-carbon-gray-70 mb-xs">Seniority</legend>
      <div className="inline-flex self-start border border-carbon-gray-50 divide-x divide-carbon-gray-20">
        {SENIORITY_OPTIONS.map(({ value, label }) => {
          const pressed = selected.includes(value);
          return (
            <button
              key={value}
              type="button"
              aria-pressed={pressed}
              onClick={() => toggle(value)}
              className={`h-[38px] min-w-[56px] px-base text-body focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-carbon-blue-60 ${
                pressed
                  ? 'bg-carbon-gray-100 text-white'
                  : 'bg-white text-carbon-gray-100 hover:bg-carbon-gray-hover'}`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
