import type { InputHTMLAttributes, JSX } from 'react';
import { InputFieldIcon } from './InputFieldIcon';
import { InputFieldMessage } from './InputFieldMessage';
import { buildInputClassName, buildInputId } from './inputField.utils';

export interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  readonly label:  string;
  readonly error?: string;
  readonly hint?:  string;
  readonly icon?:  string;
}

function buildDescribedBy(inputId: string, hasError: boolean, hint: string | undefined): string | undefined {
  if (hasError) return `${inputId}-error`;
  return hint ? `${inputId}-hint` : undefined;
}

export function InputField({
  label,
  error,
  hint,
  icon,
  id,
  className = '',
  ...rest
}: InputFieldProps): JSX.Element {
  const inputId  = buildInputId(id, label);
  const hasError = Boolean(error);

  return (
    <div className={`flex flex-col gap-2xs ${className}`}>
      <label htmlFor={inputId} className="text-body-md font-medium text-text-primary">
        {label}
      </label>

      <div className="relative flex items-center">
        <InputFieldIcon icon={icon} />
        <input
          {...rest}
          id={inputId}
          aria-invalid={hasError || undefined}
          aria-describedby={buildDescribedBy(inputId, hasError, hint)}
          className={buildInputClassName(hasError, Boolean(icon))}
        />
      </div>

      <InputFieldMessage inputId={inputId} error={error} hint={hint} />
    </div>
  );
}
