import type { IBenchQuery, IBenchResource, PaginatedResponse } from '@ibm-talent-bridge/shared-types';
import { httpClient } from '@shared/infrastructure/httpClient';
import { buildBenchQuery } from '../utils/buildBenchQuery';

export function fetchBench(query: IBenchQuery = {}): Promise<PaginatedResponse<IBenchResource>> {
  const qs = buildBenchQuery(query);
  return httpClient.get<PaginatedResponse<IBenchResource>>(qs ? `/bench?${qs}` : '/bench');
}

export function fetchBenchSkills(): Promise<readonly string[]> {
  return httpClient.get<readonly string[]>('/bench/skills');
}

export function fetchBenchResource(code: string): Promise<IBenchResource> {
  return httpClient.get<IBenchResource>(`/bench/${encodeURIComponent(code)}`);
}
