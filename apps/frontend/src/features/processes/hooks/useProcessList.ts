import { keepPreviousData, useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { IProcessListItem, PaginatedResponse } from '@ibm-talent-bridge/shared-types';
import { PROCESS_LIST_QUERY_KEY } from '../config/processList.constants';
import { fetchProcessList } from '../infrastructure/processList.infra';
import type { IProcessListParams } from '../types/processList.types';

export function useProcessList(params: IProcessListParams, options: { readonly enabled?: boolean } = {}): UseQueryResult<PaginatedResponse<IProcessListItem>> {
  return useQuery({
    queryKey: [PROCESS_LIST_QUERY_KEY, 'list', params],
    queryFn: () => fetchProcessList(params),
    enabled: options.enabled ?? true,
    placeholderData: keepPreviousData,
  });
}
