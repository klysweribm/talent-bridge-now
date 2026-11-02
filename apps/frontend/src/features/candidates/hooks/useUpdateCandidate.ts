import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import type { ICandidate, ICreateCandidateRequest } from '@ibm-talent-bridge/shared-types';
import { updateCandidate } from '../infrastructure/candidates.infra';

export interface IUpdateCandidateInput {
  readonly id: string;
  readonly request: ICreateCandidateRequest;
}

/** Reemplaza los campos de un perfil existente; solo se invoca tras la confirmación humana. */
export function useUpdateCandidate(): UseMutationResult<ICandidate, Error, IUpdateCandidateInput> {
  return useMutation<ICandidate, Error, IUpdateCandidateInput>({ mutationFn: ({ id, request }) => updateCandidate(id, request) });
}
