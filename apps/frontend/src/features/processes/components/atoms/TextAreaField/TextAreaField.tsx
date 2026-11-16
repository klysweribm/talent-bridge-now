import type { TextareaHTMLAttributes } from 'react';

export interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  readonly id:     string;
  readonly label:  string;
  readonly error?: string;
  readonly hint?:  string;
}

export function TextAreaField({ id, label, error, hint, className = '', ...rest }: TextAreaFieldProps): JSX.Element {
  const messageId = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  const border = error ? 'ring-2 ring-inset ring-carbon-red' : '';
  return (
    <div className="flex flex-col gap-sm">
      <label htmlFor={id} className="text-label text-carbon-gray-70">{label}</label>
      <textarea
        {...rest} id={id} aria-invalid={Boolean(error) || undefined} aria-describedby={messageId}
        className={`w-full min-h-28 p-base rounded-none text-body text-carbon-gray-100 bg-carbon-gray-10 border-0 border-b border-carbon-gray-50 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-carbon-blue-60 ${border} ${className}`}
      />
      {error && <span id={`${id}-error`} role="alert" className="text-label text-carbon-red">{error}</span>}
      {!error && hint && <span id={`${id}-hint`} className="text-label text-carbon-gray-70">{hint}</span>}
    </div>
  );
}
