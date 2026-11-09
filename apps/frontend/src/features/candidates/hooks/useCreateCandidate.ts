import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import type { ICandidate, ICreateCandidateRequest } from '@ibm-talent-bridge/shared-types';
import { CANDIDATE_LIST_QUERY_KEY } from '../config/candidateList.constants';
import { createCandidate } from '../infrastructure/candidates.infra';

/** Crea el candidato externo; solo se invoca tras la confirmación humana del formulario. */
export function useCreateCandidate(): UseMutationResult<ICandidate, Error, ICreateCandidateRequest> {
  const client = useQueryClient();
  return useMutation<ICandidate, Error, ICreateCandidateRequest>({
    mutationFn: request => createCandidate(request),
    onSuccess: () => client.invalidateQueries({ queryKey: [CANDIDATE_LIST_QUERY_KEY] }),
  });
}
