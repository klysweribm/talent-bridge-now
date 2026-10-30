import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { IBenchResource } from '@ibm-talent-bridge/shared-types';
import { BENCH_QUERY_KEY } from '../config/bench.constants';
import { fetchBenchResource } from '../infrastructure/bench.infra';

export function useBenchResource(code: string | null): UseQueryResult<IBenchResource> {
  return useQuery({
    queryKey: [BENCH_QUERY_KEY, 'detail', code],
    queryFn: () => fetchBenchResource(code ?? ''),
    enabled: Boolean(code),
  });
}
