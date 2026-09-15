import type { InputHTMLAttributes } from 'react';

export interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  readonly label:    string;
  readonly error?:   string;
  readonly hint?:    string;
  readonly icon?:    string;
}

export function InputField({
  label,
  error,
  hint,
  icon,
  id,
  className = '',
  ...rest
}: InputFieldProps) {
  const inputId = id ?? `input-${label.replace(/\s+/g, '-').toLowerCase()}`;
  const hasError = Boolean(error);

  return (
    <div className={`flex flex-col gap-2xs ${className}`}>
      <label
        htmlFor={inputId}
        className="text-body-md font-medium text-text-primary"
      >
        {label}
      </label>

      <div className="relative flex items-center">
        {icon && (
          <span
            aria-hidden="true"
            className="material-symbols-outlined absolute left-sm text-[18px] text-text-secondary pointer-events-none"
          >
            {icon}
          </span>
        )}
        <input
          {...rest}
          id={inputId}
          aria-invalid={hasError || undefined}
          aria-describedby={
            hasError ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
          }
          className={[
            'w-full h-10 px-sm rounded text-body-md text-text-primary',
            'bg-surface-card border border-outline',
            'placeholder:text-[#a8a8a8]',
            'focus:outline-2 focus:outline-primary-interactive focus:border-transparent',
            hasError
              ? 'border-2 border-status-danger'
              : 'border-[#8d8d8d]',
            icon ? 'pl-8' : '',
          ].join(' ')}
        />
      </div>

      {hasError && (
        <span
          id={`${inputId}-error`}
          role="alert"
          className="text-label-md text-status-danger flex items-center gap-2xs"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-[14px]">
            error
          </span>
          {error}
        </span>
      )}

      {!hasError && hint && (
        <span
          id={`${inputId}-hint`}
          className="text-label-md text-text-secondary"
        >
          {hint}
        </span>
      )}
    </div>
  );
}
