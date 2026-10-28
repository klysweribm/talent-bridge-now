import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { fetchAttentionItems } from '../infrastructure/processes.infra';
import type { IAttentionItem } from '../types/processes.types';

export function useAttentionItemsQuery(): UseQueryResult<readonly IAttentionItem[]> {
  return useQuery({ queryKey: ['processes', 'attention'], queryFn: fetchAttentionItems });
}
