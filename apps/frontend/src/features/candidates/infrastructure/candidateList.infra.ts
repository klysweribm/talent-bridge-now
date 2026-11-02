import type { ICandidateListItem, PaginatedResponse } from '@ibm-talent-bridge/shared-types';
import { httpClient } from '@shared/infrastructure/httpClient';
import type { ICandidateListParams } from '../types/candidateList.types';

export function fetchCandidateList(params: ICandidateListParams = {}): Promise<PaginatedResponse<ICandidateListItem>> {
  const qs = new URLSearchParams();
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.assignment) qs.set('assignment', params.assignment);
  const query = qs.toString();
  return httpClient.get<PaginatedResponse<ICandidateListItem>>(query ? `/candidates?${query}` : '/candidates');
}
