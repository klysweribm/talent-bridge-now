import type { JSX } from 'react';

/**
 * InputFieldIcon — ícono prefijo de un `InputField` (DT-004). Extraído para
 * mantener `InputField.tsx` bajo el límite de líneas de un atom.
 */
export interface InputFieldIconProps {
  readonly icon?: string;
}

export function InputFieldIcon({ icon }: InputFieldIconProps): JSX.Element | null {
  if (!icon) return null;

  return (
    <span
      aria-hidden="true"
      className="material-symbols-outlined absolute left-sm text-[18px] text-carbon-gray-70 pointer-events-none"
    >
      {icon}
    </span>
  );
}
