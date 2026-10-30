import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { fetchActiveProcesses } from '../infrastructure/processes.infra';
import type { IActiveProcessesPage } from '../types/processes.types';

export function useActiveProcessesQuery(limit: number): UseQueryResult<IActiveProcessesPage> {
  return useQuery({ queryKey: ['processes', 'active', limit], queryFn: () => fetchActiveProcesses(limit) });
}
