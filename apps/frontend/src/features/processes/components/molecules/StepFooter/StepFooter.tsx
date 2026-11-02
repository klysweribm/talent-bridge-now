import type { ReactNode } from 'react';
import { Button } from '@shared/components/atoms/Button';

export interface StepFooterProps {
  readonly backLabel:  string;
  readonly onBack:     () => void;
  readonly disabled?:  boolean;
  /** Acciones a la derecha (la primaria va la última). */
  readonly children:   ReactNode;
}

/** Pie común de los pasos: «Atrás» a la izquierda y las acciones a la derecha, con objetivos táctiles cómodos. */
export function StepFooter({ backLabel, onBack, disabled = false, children }: StepFooterProps): JSX.Element {
  return (
    <div className="flex flex-wrap items-center justify-between gap-md">
      <Button type="button" variant="secondary" className="min-h-11" disabled={disabled} onClick={onBack}>{backLabel}</Button>
      <div className="flex items-center gap-md">{children}</div>
    </div>
  );
}
