import type { TBenchStatus, TSeniority } from '@ibm-talent-bridge/shared-types';

/** Filtros ya normalizados que el servicio entrega al puerto de persistencia. */
export interface IBenchFilters {
  readonly skills: readonly string[];
  readonly seniority: readonly TSeniority[];
  readonly statuses: readonly TBenchStatus[];
  readonly country?: string;
  readonly availableBy?: Date;
}
