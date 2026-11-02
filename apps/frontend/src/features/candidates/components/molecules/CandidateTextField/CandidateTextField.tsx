import { forwardRef, type InputHTMLAttributes } from 'react';

export interface CandidateTextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  readonly label: string;
  readonly error?: string;
  /** El extractor no detectó este dato: se resalta con borde y texto, no solo con color. */
  readonly missing?: boolean;
}

export const MISSING_HINT = 'No se detectó en el CV: complétalo si lo conoces.';

export const CandidateTextField = forwardRef<HTMLInputElement, CandidateTextFieldProps>(
  function CandidateTextField({ label, error, missing = false, name, ...rest }, ref) {
    const id = `candidate-${name}`;
    const messageId = error ? `${id}-error` : missing ? `${id}-hint` : undefined;

    return (
      <div className={`flex flex-col gap-2xs ${missing ? 'border-l-4 border-status-warning pl-sm bg-status-warning-bg' : ''}`}>
        <label htmlFor={id} className="text-body-md font-medium text-text-primary">{label}</label>
        <input
          {...rest}
          ref={ref}
          id={id}
          name={name}
          aria-invalid={error ? true : undefined}
          aria-describedby={messageId}
          className={`w-full h-10 px-sm rounded text-body-md text-text-primary bg-surface-card border ${
            error ? 'border-2 border-status-danger' : 'border-outline'}`}
        />
        {error && <span id={`${id}-error`} role="alert" className="text-label-md text-status-danger">{error}</span>}
        {!error && missing && <span id={`${id}-hint`} className="text-label-md text-text-secondary">{MISSING_HINT}</span>}
      </div>
    );
  },
);
