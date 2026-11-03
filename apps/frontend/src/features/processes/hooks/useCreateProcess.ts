import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import type { ICreateProcessRequest, IProcess } from '@ibm-talent-bridge/shared-types';
import { AVAILABLE_CANDIDATES_QUERY_KEY } from '../config/processCreate.constants';
import { PROCESS_LIST_QUERY_KEY } from '../config/processList.constants';
import { createProcess } from '../infrastructure/processCreate.infra';

/** Crea el proceso; al éxito refresca la lista de procesos y los candidatos disponibles (ya no lo están). */
export function useCreateProcess(): UseMutationResult<IProcess, Error, ICreateProcessRequest> {
  const client = useQueryClient();
  return useMutation<IProcess, Error, ICreateProcessRequest>({
    mutationFn: request => createProcess(request),
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: [PROCESS_LIST_QUERY_KEY] }),
        client.invalidateQueries({ queryKey: [AVAILABLE_CANDIDATES_QUERY_KEY] }),
      ]);
    },
  });
}
