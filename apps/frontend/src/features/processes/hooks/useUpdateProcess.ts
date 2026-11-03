import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import type { IProcessDetail, IUpdateProcessRequest } from '@ibm-talent-bridge/shared-types';
import { updateProcess } from '../infrastructure/processUpdate.infra';
import { invalidateProcessQueries } from './processMutations.utils';

/** PATCH del proceso; al éxito refresca detalle, lista y candidatos disponibles (cancelar los libera). */
export function useUpdateProcess(id: string): UseMutationResult<IProcessDetail, Error, IUpdateProcessRequest> {
  const client = useQueryClient();
  return useMutation<IProcessDetail, Error, IUpdateProcessRequest>({
    mutationFn: request => updateProcess(id, request),
    onSuccess: () => invalidateProcessQueries(client, id),
  });
}
