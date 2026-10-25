import { QueryClient } from '@tanstack/react-query';

const QUERY_STALE_TIME_MS = 1000 * 60 * 5;
const QUERY_RETRY_COUNT = 1;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: QUERY_STALE_TIME_MS, retry: QUERY_RETRY_COUNT },
  },
});
