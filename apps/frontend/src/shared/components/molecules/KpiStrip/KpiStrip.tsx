import type { ReactNode } from 'react';

export interface KpiStripProps {
  /** Celdas de KPI (p. ej. `KpiCard` o un contador clicable). */
  readonly children:   ReactNode;
  readonly className?: string;
}

/** Tira de KPIs: rejilla auto-fit de 220px con 1px de separación (el fondo gris dibuja las líneas). */
export function KpiStrip({ children, className = '' }: KpiStripProps): JSX.Element {
  return (
    <div
      className={`grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-px bg-carbon-gray-20 border border-carbon-gray-20 ${className}`}
    >
      {children}
    </div>
  );
}
