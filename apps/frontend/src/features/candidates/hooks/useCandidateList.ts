import { keepPreviousData, useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { ICandidateListItem, PaginatedResponse } from '@ibm-talent-bridge/shared-types';
import { CANDIDATE_LIST_QUERY_KEY } from '../config/candidateList.constants';
import { fetchCandidateList } from '../infrastructure/candidateList.infra';
import type { ICandidateListParams } from '../types/candidateList.types';

export function useCandidateList(params: ICandidateListParams): UseQueryResult<PaginatedResponse<ICandidateListItem>> {
  return useQuery({
    queryKey: [CANDIDATE_LIST_QUERY_KEY, 'list', params],
    queryFn: () => fetchCandidateList(params),
    placeholderData: keepPreviousData,
    // Un candidato recién creado debe verse al volver a la lista (el staleTime global es de 5 min).
    staleTime: 0,
    refetchOnMount: 'always',
  });
}
