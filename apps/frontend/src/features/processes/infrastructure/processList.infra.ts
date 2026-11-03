import type { IProcessDetail, IProcessListItem, PaginatedResponse } from '@ibm-talent-bridge/shared-types';
import { httpClient } from '@shared/infrastructure/httpClient';
import type { IProcessListParams } from '../types/processList.types';

export function fetchProcessList(params: IProcessListParams = {}): Promise<PaginatedResponse<IProcessListItem>> {
  const qs = new URLSearchParams();
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.q) qs.set('q', params.q);
  const query = qs.toString();
  return httpClient.get<PaginatedResponse<IProcessListItem>>(query ? `/processes?${query}` : '/processes');
}

export function fetchProcessDetail(id: string): Promise<IProcessDetail> {
  return httpClient.get<IProcessDetail>(`/processes/${encodeURIComponent(id)}`);
}
