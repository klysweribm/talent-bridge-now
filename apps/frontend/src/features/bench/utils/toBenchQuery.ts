import type { IBenchQuery } from '@ibm-talent-bridge/shared-types';
import type { IBenchFilters } from '../types/bench.types';

/** Filtros de la URL → query de la API, sin claves vacías. */
export function toBenchQuery(filters: IBenchFilters): IBenchQuery {
  const { skills, seniority, availableBy, country, page, limit } = filters;
  return {
    ...(skills.length > 0 && { skills }),
    ...(seniority.length > 0 && { seniority }),
    ...(availableBy && { availableBy }),
    ...(country && { country }),
    ...(page && { page }),
    ...(limit && { limit }),
  };
}
