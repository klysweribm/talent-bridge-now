import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { fetchDashboardSummary } from '../infrastructure/processes.infra';
import type { IDashboardSummary } from '../types/processes.types';

export function useDashboardSummaryQuery(): UseQueryResult<IDashboardSummary> {
  return useQuery({ queryKey: ['processes', 'dashboard-summary'], queryFn: fetchDashboardSummary });
}
