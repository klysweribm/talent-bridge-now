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
    <div className="flex flex-col gap-sm">
      <label htmlFor={id} className="text-label text-carbon-gray-70">{label}</label>
      <select
        id={id}
        value={value}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={messageId}
        onChange={event => onChange(event.target.value)}
        onBlur={onBlur}
        className={`w-full h-10 px-base rounded-none text-body text-carbon-gray-100 bg-carbon-gray-10 border-0 border-b border-carbon-gray-50 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-carbon-blue-60 ${error ? 'ring-2 ring-inset ring-carbon-red' : ''}`}
      >
        <option value="">{placeholder}</option>
        {options.map(option => <option key={option.id} value={option.id}>{option.fullName}</option>)}
      </select>
      {error && <span id={`${id}-error`} className="text-label text-carbon-red">{error}</span>}
      {!error && hint && <span id={`${id}-hint`} className="text-label text-carbon-gray-70">{hint}</span>}
    </div>
  );
}
