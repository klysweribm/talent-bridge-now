import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import * as infra from '../infrastructure/candidateList.infra';
import { makeListItem, makeListPage } from '../test-utils';
import { useCandidateList } from './useCandidateList';

vi.mock('../infrastructure/candidateList.infra');

describe('useCandidateList', () => {
  beforeEach(() => vi.resetAllMocks());

  it('should load the list with the given params', async () => {
    vi.mocked(infra.fetchCandidateList).mockResolvedValue(makeListPage([]));
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { readonly children: ReactNode }): JSX.Element => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
    const { result } = renderHook(() => useCandidateList({ page: 2, assignment: 'available' }), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(infra.fetchCandidateList).toHaveBeenCalledWith({ page: 2, assignment: 'available' });
  });

  it('should refetch on mount even with a warm cache so a just-created candidate shows up', async () => {
    const fetchList = vi.mocked(infra.fetchCandidateList);
    fetchList.mockResolvedValueOnce(makeListPage([])).mockResolvedValue(makeListPage([makeListItem()]));
    const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: 300_000 } } });
    const wrapper = ({ children }: { readonly children: ReactNode }): JSX.Element => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
    const first = renderHook(() => useCandidateList({}), { wrapper });
    await waitFor(() => expect(first.result.current.isSuccess).toBe(true));
    first.unmount();
    const second = renderHook(() => useCandidateList({}), { wrapper });
    await waitFor(() => expect(second.result.current.data?.data).toHaveLength(1));
    expect(fetchList).toHaveBeenCalledTimes(2);
  });
});
