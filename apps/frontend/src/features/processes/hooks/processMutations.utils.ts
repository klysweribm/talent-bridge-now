import type { QueryClient } from '@tanstack/react-query';
import { AVAILABLE_CANDIDATES_QUERY_KEY } from '../config/processCreate.constants';
import { PROCESS_LIST_QUERY_KEY } from '../config/processList.constants';

/** Tras cualquier mutación del proceso: detalle, lista y candidatos disponibles quedan obsoletos. */
export async function invalidateProcessQueries(client: QueryClient, id: string): Promise<void> {
  await Promise.all([
    client.invalidateQueries({ queryKey: [PROCESS_LIST_QUERY_KEY, 'detail', id] }),
    client.invalidateQueries({ queryKey: [PROCESS_LIST_QUERY_KEY] }),
    client.invalidateQueries({ queryKey: [AVAILABLE_CANDIDATES_QUERY_KEY] }),
  ]);
}
