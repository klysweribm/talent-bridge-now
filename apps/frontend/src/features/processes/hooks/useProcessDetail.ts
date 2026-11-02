import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { IProcessDetail } from '@ibm-talent-bridge/shared-types';
import { PROCESS_LIST_QUERY_KEY } from '../config/processList.constants';
import { fetchProcessDetail } from '../infrastructure/processList.infra';

export function useProcessDetail(id: string): UseQueryResult<IProcessDetail> {
  return useQuery({
    queryKey: [PROCESS_LIST_QUERY_KEY, 'detail', id],
    queryFn: () => fetchProcessDetail(id),
  });
}
