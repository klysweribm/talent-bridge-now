import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { CANDIDATE_LIST_QUERY_KEY } from '../config/candidateList.constants';
import { createCandidate } from '../infrastructure/candidates.infra';
import { makeCandidate } from '../test-utils';
import { useCreateCandidate } from './useCreateCandidate';

vi.mock('../infrastructure/candidates.infra', () => ({ createCandidate: vi.fn() }));

function setup(): { client: QueryClient; wrapper: (props: { children: ReactNode }) => JSX.Element } {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }): JSX.Element => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  return { client, wrapper };
}

describe('useCreateCandidate', () => {
  const request = { fullName: 'A', email: 'a@example.com' };

  it('should invalidate the candidate list when the creation succeeds', async () => {
    vi.mocked(createCandidate).mockResolvedValue(makeCandidate());
    const { client, wrapper } = setup();
    const spy = vi.spyOn(client, 'invalidateQueries');
    const { result } = renderHook(() => useCreateCandidate(), { wrapper });
    await act(async () => { await result.current.mutateAsync(request); });
    expect(spy).toHaveBeenCalledWith({ queryKey: [CANDIDATE_LIST_QUERY_KEY] });
  });

  it('should not invalidate when the creation fails', async () => {
    vi.mocked(createCandidate).mockRejectedValue(new Error('boom'));
    const { client, wrapper } = setup();
    const spy = vi.spyOn(client, 'invalidateQueries');
    const { result } = renderHook(() => useCreateCandidate(), { wrapper });
    await act(async () => { await result.current.mutateAsync(request).catch(() => undefined); });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(spy).not.toHaveBeenCalled();
  });
});
