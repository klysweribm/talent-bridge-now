import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import type { IProcessDetail } from '@ibm-talent-bridge/shared-types';
import { addProcessCandidate, removeProcessCandidate } from '../infrastructure/processUpdate.infra';
import { invalidateProcessQueries } from './processMutations.utils';

export interface IProcessCandidateActions {
  readonly add:    UseMutationResult<IProcessDetail, Error, string>;
  readonly remove: UseMutationResult<IProcessDetail, Error, string>;
}

/** Asociar / quitar un candidato (recibe el `candidateId`); al éxito refresca detalle, lista y disponibles. */
export function useProcessCandidateActions(id: string): IProcessCandidateActions {
  const client = useQueryClient();
  const onSuccess = (): Promise<void> => invalidateProcessQueries(client, id);
  const add = useMutation<IProcessDetail, Error, string>({ mutationFn: candidateId => addProcessCandidate(id, candidateId), onSuccess });
  const remove = useMutation<IProcessDetail, Error, string>({ mutationFn: candidateId => removeProcessCandidate(id, candidateId), onSuccess });
  return { add, remove };
}
