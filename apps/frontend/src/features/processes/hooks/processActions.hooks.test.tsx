import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import type { IProcessDetail } from '@ibm-talent-bridge/shared-types';
import * as infra from '../infrastructure/processUpdate.infra';
import { useProcessCandidateActions } from './useProcessCandidateActions';
import { useUpdateProcess } from './useUpdateProcess';

vi.mock('../infrastructure/processUpdate.infra');

const DETAIL = { id: 'p1' } as IProcessDetail;

function setup(): { client: QueryClient; invalidate: ReturnType<typeof vi.spyOn>; wrapper: ({ children }: { children: ReactNode }) => JSX.Element } {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const invalidate = vi.spyOn(client, 'invalidateQueries');
  const wrapper = ({ children }: { children: ReactNode }): JSX.Element => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  return { client, invalidate, wrapper };
}
const keys = (spy: ReturnType<typeof vi.spyOn>): unknown[] => spy.mock.calls.map(call => (call[0] as { queryKey: unknown }).queryKey);

describe('process mutation hooks', () => {
  beforeEach(() => { vi.resetAllMocks(); });

  it('should PATCH and invalidate detail, list and available candidates on success', async () => {
    vi.mocked(infra.updateProcess).mockResolvedValue(DETAIL);
    const { invalidate, wrapper } = setup();
    const { result } = renderHook(() => useUpdateProcess('p1'), { wrapper });
    await act(async () => { await result.current.mutateAsync({ status: 'closed' }); });
    expect(infra.updateProcess).toHaveBeenCalledWith('p1', { status: 'closed' });
    expect(keys(invalidate)).toEqual([['process-list', 'detail', 'p1'], ['process-list'], ['available-candidates']]);
  });

  it('should not invalidate when the PATCH fails and should expose the error', async () => {
    vi.mocked(infra.updateProcess).mockRejectedValue(new Error('nope'));
    const { invalidate, wrapper } = setup();
    const { result } = renderHook(() => useUpdateProcess('p1'), { wrapper });
    act(() => { result.current.mutate({ title: 'x' }); });
    await waitFor(() => expect(result.current.error?.message).toBe('nope'));
    expect(invalidate).not.toHaveBeenCalled();
  });

  it('should add and remove a candidate invalidating the same queries', async () => {
    vi.mocked(infra.addProcessCandidate).mockResolvedValue(DETAIL);
    vi.mocked(infra.removeProcessCandidate).mockResolvedValue(DETAIL);
    const { invalidate, wrapper } = setup();
    const { result } = renderHook(() => useProcessCandidateActions('p1'), { wrapper });
    await act(async () => { await result.current.add.mutateAsync('c1'); });
    await act(async () => { await result.current.remove.mutateAsync('c2'); });
    expect(infra.addProcessCandidate).toHaveBeenCalledWith('p1', 'c1');
    expect(infra.removeProcessCandidate).toHaveBeenCalledWith('p1', 'c2');
    expect(keys(invalidate)).toHaveLength(6);
    expect(keys(invalidate)).toContainEqual(['available-candidates']);
  });
});
