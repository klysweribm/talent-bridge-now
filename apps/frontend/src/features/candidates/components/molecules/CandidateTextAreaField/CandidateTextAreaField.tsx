import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { describedBy, FieldMessages } from '../CandidateTextField/fieldMessages';
import { FIELD_LABEL, FIELD_MISSING, textareaClasses } from '../CandidateTextField/fieldStyles';

export interface CandidateTextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  readonly label: string;
  readonly error?: string;
  /** Ayuda visible bajo el campo (formato esperado). */
  readonly hint?: string;
  /** El extractor no detectó este dato: se resalta con borde y texto, no solo con color. */
  readonly missing?: boolean;
}

/** Campo de varias líneas para listas (una skill por línea). Misma semántica de error y "no detectado" que el campo de texto. */
export const CandidateTextAreaField = forwardRef<HTMLTextAreaElement, CandidateTextAreaFieldProps>(
  function CandidateTextAreaField({ label, error, hint, missing = false, name, rows = 5, ...rest }, ref) {
    const id = `candidate-${name}`;

    return (
      <div className={`flex flex-col gap-2xs md:col-span-2 ${missing ? FIELD_MISSING : ''}`}>
        <label htmlFor={id} className={FIELD_LABEL}>{label}</label>
        <textarea
          {...rest}
          ref={ref}
          id={id}
          name={name}
          rows={rows}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy({ id, error, hint, missing })}
          className={textareaClasses(Boolean(error))}
        />
        <FieldMessages id={id} error={error} hint={hint} missing={missing} />
      </div>
    );
  },
);
