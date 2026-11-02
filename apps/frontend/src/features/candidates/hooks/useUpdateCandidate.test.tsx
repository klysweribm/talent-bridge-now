import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useUpdateCandidate } from './useUpdateCandidate';
import { updateCandidate } from '../infrastructure/candidates.infra';
import { makeCandidate } from '../test-utils';

vi.mock('../infrastructure/candidates.infra', () => ({ updateCandidate: vi.fn() }));

describe('useUpdateCandidate', () => {
  it('should call updateCandidate with the id and request and expose the updated candidate', async () => {
    vi.mocked(updateCandidate).mockResolvedValue(makeCandidate({ updateCount: 1 }));
    const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const wrapper = ({ children }: { children: ReactNode }): JSX.Element => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
    const { result } = renderHook(() => useUpdateCandidate(), { wrapper });
    const request = { fullName: 'A', email: 'a@example.com' };
    result.current.mutate({ id: 'c1', request });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(updateCandidate).toHaveBeenCalledWith('c1', request);
    expect(result.current.data?.updateCount).toBe(1);
  });
});
