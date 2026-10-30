import type { IBenchQuery } from '@ibm-talent-bridge/shared-types';

/** Query string (sin `?`) para GET /bench: omite vacíos y repite los arrays. */
export function buildBenchQuery(query: IBenchQuery): string {
  const params = new URLSearchParams();
  const appendAll = (key: string, values: readonly string[] | undefined): void => {
    (values ?? []).filter(value => value !== '').forEach(value => params.append(key, value));
  };

  appendAll('skills', query.skills);
  appendAll('seniority', query.seniority);
  appendAll('status', query.status);
  if (query.availableBy) params.set('availableBy', query.availableBy);
  if (query.country) params.set('country', query.country);
  if (query.page !== undefined) params.set('page', String(query.page));
  if (query.limit !== undefined) params.set('limit', String(query.limit));

  return params.toString();
}
