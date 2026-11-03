import type { TProcessStatus } from '@ibm-talent-bridge/shared-types';

export interface IProcessStatusChip {
  readonly label:   string;
  /** Clases de Tailwind sobre tokens (fondo + texto); nunca hex. */
  readonly classes: string;
}

/** Etiqueta y color de cada estado del proceso; el texto es siempre visible (el color no es el único canal). */
export const PROCESS_STATUS_CHIP: Readonly<Record<TProcessStatus, IProcessStatusChip>> = {
  open:         { label: 'Abierto',    classes: 'bg-surface-high text-text-secondary' },
  in_progress:  { label: 'Avanzando',  classes: 'bg-status-info-bg text-status-info-text' },
  interviewing: { label: 'Entrevista', classes: 'bg-status-purple-bg text-status-purple-text' },
  closed:       { label: 'Cerrado',    classes: 'bg-status-success-bg text-status-success-text' },
  cancelled:    { label: 'Cancelado',  classes: 'bg-status-danger-bg text-status-danger' },
};

/** Orden en que se ofrecen los estados en el selector. */
export const PROCESS_STATUS_ORDER: readonly TProcessStatus[] = ['open', 'in_progress', 'interviewing', 'closed', 'cancelled'];
