import { forwardRef, type SelectHTMLAttributes } from 'react';
import { CONTROL_CLASSES, SENIORITY_OPTIONS } from '@features/bench/config/bench.constants';
import { FIELD_LABEL, FIELD_MISSING } from '../CandidateTextField/fieldStyles';
import { MISSING_HINT } from '../CandidateTextField';

export interface SeniorityFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  readonly missing?: boolean;
}

// forwardRef: react-hook-form necesita el <select> para sembrar el valor del borrador.
export const SeniorityField = forwardRef<HTMLSelectElement, SeniorityFieldProps>(
  function SeniorityField({ missing = false, className = '', ...rest }, ref) {
    return (
      <div className={`flex flex-col gap-2xs ${missing ? FIELD_MISSING : ''} ${className}`}>
        <label htmlFor="candidate-seniority" className={FIELD_LABEL}>Seniority</label>
        <select
          {...rest}
          ref={ref}
          id="candidate-seniority"
          aria-describedby={missing ? 'candidate-seniority-hint' : undefined}
          className={CONTROL_CLASSES}
        >
          <option value="">Sin definir</option>
          {SENIORITY_OPTIONS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
        </select>
        {missing && <span id="candidate-seniority-hint" className="text-label text-carbon-gray-70">{MISSING_HINT}</span>}
      </div>
    );
  },
);
