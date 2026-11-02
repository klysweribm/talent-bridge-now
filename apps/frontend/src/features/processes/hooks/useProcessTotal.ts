import { useProcessList } from './useProcessList';
import { PROCESS_TOTAL_PARAMS } from '../config/processList.constants';
import type { UseQueryResult } from '@tanstack/react-query';
import type { IProcessListItem, PaginatedResponse } from '@ibm-talent-bridge/shared-types';

/** Total real de procesos (GET /processes?limit=1). Cuelga de PROCESS_LIST_QUERY_KEY: se invalida al crear. */
export function useProcessTotal(enabled: boolean): UseQueryResult<PaginatedResponse<IProcessListItem>> {
  return useProcessList(PROCESS_TOTAL_PARAMS, { enabled });
}
