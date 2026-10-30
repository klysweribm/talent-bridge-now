import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { BENCH_QUERY_KEY, SKILLS_STALE_TIME_MS } from '../config/bench.constants';
import { fetchBenchSkills } from '../infrastructure/bench.infra';

export function useBenchSkills(): UseQueryResult<readonly string[]> {
  return useQuery({
    queryKey: [BENCH_QUERY_KEY, 'skills'],
    queryFn: fetchBenchSkills,
    staleTime: SKILLS_STALE_TIME_MS,
  });
}
