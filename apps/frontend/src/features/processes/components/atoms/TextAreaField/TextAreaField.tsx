import type { TextareaHTMLAttributes } from 'react';

export interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  readonly id:     string;
  readonly label:  string;
  readonly error?: string;
  readonly hint?:  string;
}

export function TextAreaField({ id, label, error, hint, className = '', ...rest }: TextAreaFieldProps): JSX.Element {
  const messageId = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  const border = error ? 'border-2 border-status-danger' : 'border-outline-field';
  return (
    <div className="flex flex-col gap-2xs">
      <label htmlFor={id} className="text-body-md font-medium text-text-primary">{label}</label>
      <textarea
        {...rest} id={id} aria-invalid={Boolean(error) || undefined} aria-describedby={messageId}
        className={`w-full min-h-28 p-sm rounded text-body-md text-text-primary bg-surface-card border focus:outline-2 focus:outline-primary-interactive ${border} ${className}`}
      />
      {error && <span id={`${id}-error`} role="alert" className="text-label-md text-status-danger">{error}</span>}
      {!error && hint && <span id={`${id}-hint`} className="text-label-md text-text-secondary">{hint}</span>}
    </div>
  );
}
