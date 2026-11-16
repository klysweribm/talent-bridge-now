import type { IBenchResource } from '@ibm-talent-bridge/shared-types';
import { SHELL_COPY } from '@shared/config/shell.copy';

export interface ISearchItem {
  readonly id:    string;
  readonly title: string;
  readonly sub:   string;
  readonly meta:  string;
  readonly to:    string;
}

export interface ISearchGroup {
  readonly id:    string;
  readonly title: string;
  readonly items: readonly ISearchItem[];
}

/** Destino de un recurso de banca: abre el drawer de /bench (contrato `?resource=` de la feature bench). */
const BENCH_RESOURCE_URL = '/bench?resource=';

function matches(resource: IBenchResource, needle: string): boolean {
  const haystack = [
    resource.displayName, resource.primaryRole, resource.benchCode, resource.practice,
    resource.location.country, ...resource.skills.map(skill => skill.name),
  ];
  return haystack.some(value => value.toLowerCase().includes(needle));
}

/** Agrupa los resultados de la búsqueda global (hoy solo banca); sin texto o sin coincidencias → []. */
export function buildSearchGroups(resources: readonly IBenchResource[], query: string): readonly ISearchGroup[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];
  const items = resources.filter(resource => matches(resource, needle)).map(resource => ({
    id: resource.id,
    title: resource.displayName,
    sub: resource.primaryRole,
    meta: resource.benchCode,
    to: `${BENCH_RESOURCE_URL}${encodeURIComponent(resource.benchCode)}`,
  }));
  return items.length > 0 ? [{ id: 'bench', title: SHELL_COPY.benchGroupTitle, items }] : [];
}
