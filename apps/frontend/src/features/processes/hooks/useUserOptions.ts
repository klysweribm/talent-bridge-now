import { keepPreviousData, useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { IUserOption, PaginatedResponse } from '@ibm-talent-bridge/shared-types';
import { USER_OPTIONS_PAGE_LIMIT, USER_OPTIONS_QUERY_KEY } from '../config/processCreate.constants';
import { fetchUserOptions } from '../infrastructure/processCreate.infra';
import type { TProcessCreatorRole } from '../types/processCreate.types';

/** `enabled=false` evita la petición cuando el selector no se muestra (p. ej. PM sin elegir reclutador). */
export function useUserOptions(role: TProcessCreatorRole, enabled = true): UseQueryResult<PaginatedResponse<IUserOption>> {
  return useQuery({
    queryKey: [USER_OPTIONS_QUERY_KEY, role],
    queryFn: () => fetchUserOptions(role, { limit: USER_OPTIONS_PAGE_LIMIT }),
    placeholderData: keepPreviousData,
    enabled,
  });
}
