import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { IProcessLimits } from '@ibm-talent-bridge/shared-types';
import { useCanSeeProcesses } from './useCanSeeProcesses';
import { PROCESS_LIMITS_QUERY_KEY } from '../config/processCreate.constants';
import { fetchProcessLimits } from '../infrastructure/processCreate.infra';

/** Límites del servidor (server state, una sola query cacheada). technical_ref recibe 403: para él nunca se consulta. */
export function useProcessLimits(): UseQueryResult<IProcessLimits> {
  const allowed = useCanSeeProcesses();
  return useQuery({ queryKey: [PROCESS_LIMITS_QUERY_KEY], queryFn: fetchProcessLimits, enabled: allowed });
}
