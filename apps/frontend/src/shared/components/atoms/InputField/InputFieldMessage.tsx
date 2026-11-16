import type { JSX } from 'react';

/**
 * InputFieldMessage — mensaje de error o hint bajo un `InputField` (DT-004).
 * Extraído para mantener `InputField.tsx` bajo el límite de líneas/complejidad
 * de un atom. Props-only, sin lógica propia.
 */
export interface InputFieldMessageProps {
  readonly inputId: string;
  readonly error?:  string;
  readonly hint?:   string;
}

export function InputFieldMessage({ inputId, error, hint }: InputFieldMessageProps): JSX.Element | null {
  if (error) {
    return (
      <span
        id={`${inputId}-error`}
        role="alert"
        className="text-body-sm text-carbon-red flex items-center gap-2xs"
      >
        <span aria-hidden="true" className="material-symbols-outlined text-[14px]">
          error
        </span>
        {error}
      </span>
    );
  }

  if (hint) {
    return (
      <span id={`${inputId}-hint`} className="text-body-sm text-carbon-gray-60">
        {hint}
      </span>
    );
  }

  return null;
}
