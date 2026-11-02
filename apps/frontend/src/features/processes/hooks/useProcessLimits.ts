import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { IProcessLimits } from '@ibm-talent-bridge/shared-types';
import { PROCESS_LIMITS_QUERY_KEY } from '../config/processCreate.constants';
import { fetchProcessLimits } from '../infrastructure/processCreate.infra';

export function useProcessLimits(): UseQueryResult<IProcessLimits> {
  return useQuery({ queryKey: [PROCESS_LIMITS_QUERY_KEY], queryFn: fetchProcessLimits });
}
