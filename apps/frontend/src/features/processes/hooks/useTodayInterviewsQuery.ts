import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { fetchTodayInterviews } from '../infrastructure/processes.infra';
import type { ITodayInterview } from '../types/processes.types';

export function useTodayInterviewsQuery(): UseQueryResult<readonly ITodayInterview[]> {
  return useQuery({ queryKey: ['interviews', 'today'], queryFn: fetchTodayInterviews });
}
