import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import type { ICandidate, ICreateCandidateRequest } from '@ibm-talent-bridge/shared-types';
import { createCandidate } from '../infrastructure/candidates.infra';

/** Crea el candidato externo; solo se invoca tras la confirmación humana del formulario. */
export function useCreateCandidate(): UseMutationResult<ICandidate, Error, ICreateCandidateRequest> {
  return useMutation<ICandidate, Error, ICreateCandidateRequest>({ mutationFn: request => createCandidate(request) });
}
