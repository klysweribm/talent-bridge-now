import { keepPreviousData, useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { IBenchQuery, IBenchResource, PaginatedResponse } from '@ibm-talent-bridge/shared-types';
import { BENCH_QUERY_KEY } from '../config/bench.constants';
import { fetchBench } from '../infrastructure/bench.infra';

export function useBenchList(query: IBenchQuery): UseQueryResult<PaginatedResponse<IBenchResource>> {
  return useQuery({
    queryKey: [BENCH_QUERY_KEY, 'list', query],
    queryFn: () => fetchBench(query),
    placeholderData: keepPreviousData,
  });
}
