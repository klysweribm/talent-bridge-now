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
    <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-md border-t border-carbon-gray-20 bg-carbon-gray-10 py-base">
      <Button type="button" variant="secondary" disabled={disabled} onClick={onBack}>{backLabel}</Button>
      <div className="flex items-center gap-md">{children}</div>
    </div>
  );
}
