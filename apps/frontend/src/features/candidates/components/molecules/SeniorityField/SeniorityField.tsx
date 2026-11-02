import { forwardRef, type SelectHTMLAttributes } from 'react';
import { CONTROL_CLASSES, SENIORITY_OPTIONS } from '@features/bench/config/bench.constants';
import { MISSING_HINT } from '../CandidateTextField';

export interface SeniorityFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  readonly missing?: boolean;
}

// forwardRef: react-hook-form necesita el <select> para sembrar el valor del borrador.
export const SeniorityField = forwardRef<HTMLSelectElement, SeniorityFieldProps>(
  function SeniorityField({ missing = false, className = '', ...rest }, ref) {
    return (
      <div className={`flex flex-col gap-2xs ${missing ? 'border-l-4 border-status-warning pl-sm bg-status-warning-bg' : ''} ${className}`}>
        <label htmlFor="candidate-seniority" className="text-body-md font-medium text-text-primary">Seniority</label>
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
        {missing && <span id="candidate-seniority-hint" className="text-label-md text-text-secondary">{MISSING_HINT}</span>}
      </div>
    );
  },
);
