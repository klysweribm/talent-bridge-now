import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import * as infra from '../infrastructure/bench.infra';
import { makePage, makeResource } from '../test-utils';
import { useBenchList } from './useBenchList';
import { useBenchResource } from './useBenchResource';
import { useBenchSkills } from './useBenchSkills';

vi.mock('../infrastructure/bench.infra');

function wrapper({ children }: { readonly children: ReactNode }): JSX.Element {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('bench queries', () => {
  beforeEach(() => vi.resetAllMocks());

  it('should fetch the list with the given query', async () => {
    vi.mocked(infra.fetchBench).mockResolvedValue(makePage([makeResource()]));
    const { result } = renderHook(() => useBenchList({ page: 2 }), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(infra.fetchBench).toHaveBeenCalledWith({ page: 2 });
  });

  it('should keep the previous data while the next query loads', async () => {
    vi.mocked(infra.fetchBench).mockResolvedValueOnce(makePage([makeResource()]));
    const { result, rerender } = renderHook(({ page }) => useBenchList({ page }), { wrapper, initialProps: { page: 1 } });
    await waitFor(() => expect(result.current.data?.data).toHaveLength(1));
    vi.mocked(infra.fetchBench).mockReturnValueOnce(new Promise(() => undefined));
    rerender({ page: 2 });
    expect(result.current.data?.data).toHaveLength(1);
    expect(result.current.isPlaceholderData).toBe(true);
  });

  it('should fetch the skills', async () => {
    vi.mocked(infra.fetchBenchSkills).mockResolvedValue(['Java']);
    const { result } = renderHook(() => useBenchSkills(), { wrapper });
    await waitFor(() => expect(result.current.data).toEqual(['Java']));
  });

  it('should not fetch the resource when there is no code', () => {
    renderHook(() => useBenchResource(null), { wrapper });
    expect(infra.fetchBenchResource).not.toHaveBeenCalled();
  });

  it('should fetch the resource when a code is given', async () => {
    vi.mocked(infra.fetchBenchResource).mockResolvedValue(makeResource());
    const { result } = renderHook(() => useBenchResource('BN-0001'), { wrapper });
    await waitFor(() => expect(result.current.data?.benchCode).toBe('BN-0001'));
  });
});
