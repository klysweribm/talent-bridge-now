import { keepPreviousData, useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { IProcessCandidateSummary, PaginatedResponse } from '@ibm-talent-bridge/shared-types';
import { AVAILABLE_CANDIDATES_QUERY_KEY } from '../config/processCreate.constants';
import { fetchAvailableCandidates } from '../infrastructure/processCreate.infra';
import type { IPageParams } from '../types/processCreate.types';

export function useAvailableCandidates(params: IPageParams): UseQueryResult<PaginatedResponse<IProcessCandidateSummary>> {
  return useQuery({
    queryKey: [AVAILABLE_CANDIDATES_QUERY_KEY, params],
    queryFn: () => fetchAvailableCandidates(params),
    placeholderData: keepPreviousData,
    // El staleTime global es de 5 min: sin esto no se vería el candidato recién creado al volver de /candidates/new.
    staleTime: 0,
    refetchOnMount: 'always',
  });
}
