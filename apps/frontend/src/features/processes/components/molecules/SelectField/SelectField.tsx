import type { IUserOption } from '@ibm-talent-bridge/shared-types';

export interface SelectFieldProps {
  readonly id:          string;
  readonly label:       string;
  readonly placeholder: string;
  readonly options:     readonly IUserOption[];
  readonly value:       string;
  readonly error?:      string;
  readonly hint?:       string;
  readonly onChange:    (value: string) => void;
  readonly onBlur:      () => void;
}

export function SelectField({ id, label, placeholder, options, value, error, hint, onChange, onBlur }: SelectFieldProps): JSX.Element {
  const messageId = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className="flex flex-col gap-2xs">
      <label htmlFor={id} className="text-body-md font-medium text-text-primary">{label}</label>
      <select
        id={id}
        value={value}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={messageId}
        onChange={event => onChange(event.target.value)}
        onBlur={onBlur}
        className={`w-full h-10 px-sm rounded text-body-md text-text-primary bg-surface-card border focus:outline-2 focus:outline-primary-interactive ${error ? 'border-2 border-status-danger' : 'border-outline'}`}
      >
        <option value="">{placeholder}</option>
        {options.map(option => <option key={option.id} value={option.id}>{option.fullName}</option>)}
      </select>
      {error && <span id={`${id}-error`} className="text-label-md text-status-danger">{error}</span>}
      {!error && hint && <span id={`${id}-hint`} className="text-label-md text-text-secondary">{hint}</span>}
    </div>
  );
}
