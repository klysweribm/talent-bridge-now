import type { JSX } from 'react';

/**
 * ButtonAffix — spinner de loading o ícono prefijo de `Button` (DT-006).
 * Extraído para mantener el componente bajo el límite de líneas de un atom.
 */
export interface ButtonAffixProps {
  readonly loading: boolean;
  readonly icon?:   string;
}

export function ButtonAffix({ loading, icon }: ButtonAffixProps): JSX.Element | null {
  if (loading) {
    return (
      <span aria-hidden="true" className="material-symbols-outlined animate-spin text-[16px]">
        progress_activity
      </span>
    );
  }

  if (icon) {
    return (
      <span aria-hidden="true" className="material-symbols-outlined text-[18px]">
        {icon}
      </span>
    );
  }

  return null;
}
