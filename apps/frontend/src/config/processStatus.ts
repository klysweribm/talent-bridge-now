import type { TProcessStatus } from '@ibm-talent-bridge/shared-types';

export interface IProcessStatusChip {
  readonly label:   string;
  /** Clases de Tailwind sobre tokens (fondo + texto); nunca hex. */
  readonly classes: string;
  /** Clase de fondo del punto de 6px que precede a la etiqueta. */
  readonly dot:     string;
}

/** Etiqueta y color de cada estado del proceso; el texto es siempre visible (el color no es el único canal). */
export const PROCESS_STATUS_CHIP: Readonly<Record<TProcessStatus, IProcessStatusChip>> = {
  open:         { label: 'Abierto',    classes: 'bg-carbon-green-tag-bg text-carbon-green-tag-text', dot: 'bg-carbon-green' },
  in_progress:  { label: 'Avanzando',  classes: 'bg-carbon-blue-20 text-carbon-blue-80', dot: 'bg-carbon-blue-60' },
  interviewing: { label: 'Entrevista', classes: 'bg-status-purple-bg text-status-purple-text', dot: 'bg-carbon-chart-purple' },
  closed:       { label: 'Cerrado',    classes: 'bg-carbon-gray-20 text-carbon-gray-100', dot: 'bg-carbon-gray-60' },
  cancelled:    { label: 'Cancelado',  classes: 'bg-carbon-red-10 text-carbon-red', dot: 'bg-carbon-red' },
};

/** Orden en que se ofrecen los estados en el selector. */
export const PROCESS_STATUS_ORDER: readonly TProcessStatus[] = ['open', 'in_progress', 'interviewing', 'closed', 'cancelled'];
