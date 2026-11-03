import { forwardRef, type InputHTMLAttributes } from 'react';
import { describedBy, FieldMessages } from './fieldMessages';
import { MISSING_HINT } from './missingHint';

export { MISSING_HINT };

export interface CandidateTextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  readonly label: string;
  readonly error?: string;
  /** Ayuda visible bajo el campo (p. ej. por qué no se puede editar). */
  readonly hint?: string;
  /** Confirmación positiva (p. ej. «Formato válido»); cede ante error y ayuda. */
  readonly success?: string;
  /** El extractor no detectó este dato: se resalta con borde y texto, no solo con color. */
  readonly missing?: boolean;
}

export const CandidateTextField = forwardRef<HTMLInputElement, CandidateTextFieldProps>(
  function CandidateTextField({ label, error, hint, success, missing = false, name, ...rest }, ref) {
    const id = `candidate-${name}`;

    return (
      <div className={`flex flex-col gap-2xs ${missing ? 'border-l-4 border-status-warning pl-sm bg-status-warning-bg' : ''}`}>
        <label htmlFor={id} className="text-body-md font-medium text-text-primary">{label}</label>
        <input
          {...rest}
          ref={ref}
          id={id}
          name={name}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy({ id, error, hint, missing, success })}
          className={`w-full h-10 px-sm rounded text-body-md text-text-primary bg-surface-card border ${
            error ? 'border-2 border-status-danger' : 'border-outline'}`}
        />
        <FieldMessages id={id} error={error} hint={hint} missing={missing} success={success} />
      </div>
    );
  },
);
