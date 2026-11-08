import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { AVAILABLE_CANDIDATES_QUERY_KEY, USER_OPTIONS_PAGE_LIMIT } from '../config/processCreate.constants';
import { PROCESS_LIST_QUERY_KEY } from '../config/processList.constants';
import * as infra from '../infrastructure/processCreate.infra';
import { useAuthStore } from '@features/auth/store/auth.store';
import { LIMITS_FIXTURE, mockProcessLimits } from '../test-utils';
import { useAvailableCandidates } from './useAvailableCandidates';
import { useCreateProcess } from './useCreateProcess';
import { useProcessLimits } from './useProcessLimits';
import { useUserOptions } from './useUserOptions';

vi.mock('../infrastructure/processCreate.infra');

const PAGE = { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };

function setup(): { client: QueryClient; wrapper: ({ children }: { readonly children: ReactNode }) => JSX.Element } {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { readonly children: ReactNode }): JSX.Element => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { client, wrapper };
}

describe('process create hooks', () => {
  beforeEach(() => vi.resetAllMocks());

  describe('useAvailableCandidates', () => {
    it('should load with the given params', async () => {
      vi.mocked(infra.fetchAvailableCandidates).mockResolvedValue(PAGE);
      const { result } = renderHook(() => useAvailableCandidates({ page: 2, limit: 20 }), { wrapper: setup().wrapper });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(infra.fetchAvailableCandidates).toHaveBeenCalledWith({ page: 2, limit: 20 });
    });

    it('should expose the error', async () => {
      vi.mocked(infra.fetchAvailableCandidates).mockRejectedValue(new Error('boom'));
      const { result } = renderHook(() => useAvailableCandidates({}), { wrapper: setup().wrapper });
      await waitFor(() => expect(result.current.isError).toBe(true));
    });

    it('should refetch on mount even when cached data exists', async () => {
      vi.mocked(infra.fetchAvailableCandidates).mockResolvedValue(PAGE);
      const { wrapper } = setup();
      const first = renderHook(() => useAvailableCandidates({}), { wrapper });
      await waitFor(() => expect(first.result.current.isSuccess).toBe(true));
      first.unmount();
      renderHook(() => useAvailableCandidates({}), { wrapper });
      await waitFor(() => expect(infra.fetchAvailableCandidates).toHaveBeenCalledTimes(2));
    });
  });

  describe('useUserOptions', () => {
    it('should load options for the role', async () => {
      vi.mocked(infra.fetchUserOptions).mockResolvedValue(PAGE);
      const { result } = renderHook(() => useUserOptions('pm'), { wrapper: setup().wrapper });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(infra.fetchUserOptions).toHaveBeenCalledWith('pm', { limit: USER_OPTIONS_PAGE_LIMIT });
    });

    it('should not fetch when disabled', () => {
      renderHook(() => useUserOptions('recruiter', false), { wrapper: setup().wrapper });
      expect(infra.fetchUserOptions).not.toHaveBeenCalled();
    });

    it('should expose the error', async () => {
      vi.mocked(infra.fetchUserOptions).mockRejectedValue(new Error('boom'));
      const { result } = renderHook(() => useUserOptions('pm'), { wrapper: setup().wrapper });
      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe('useProcessLimits', () => {
    beforeEach(() => { useAuthStore.setState({ user: { id: 'u', role: 'pm', email: 'u@ibm.com', name: 'u' }, token: 't' }); });
    afterEach(() => useAuthStore.getState().clearAuth());

    it('should never call the endpoint for a technical_ref (it answers 403)', () => {
      useAuthStore.setState({ user: { id: 't', role: 'technical_ref', email: 't@ibm.com', name: 't' }, token: 't' });
      const { result } = renderHook(() => useProcessLimits(), { wrapper: setup().wrapper });
      expect(result.current.fetchStatus).toBe('idle');
      expect(infra.fetchProcessLimits).not.toHaveBeenCalled();
    });

    it('should load the limits', async () => {
      mockProcessLimits();
      const { result } = renderHook(() => useProcessLimits(), { wrapper: setup().wrapper });
      await waitFor(() => expect(result.current.data).toEqual(LIMITS_FIXTURE));
    });

    it('should expose the error', async () => {
      vi.mocked(infra.fetchProcessLimits).mockRejectedValue(new Error('boom'));
      const { result } = renderHook(() => useProcessLimits(), { wrapper: setup().wrapper });
      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe('useCreateProcess', () => {
    const REQUEST = { title: 'T', clientName: 'C', opportunityRole: 'R', skills: ['Java'], roleDescription: 'D', band: 7 };

    it('should return the created process and invalidate list and available candidates', async () => {
      const created = { id: 'p1' } as never;
      vi.mocked(infra.createProcess).mockResolvedValue(created);
      const { client, wrapper } = setup();
      const spy = vi.spyOn(client, 'invalidateQueries');
      const { result } = renderHook(() => useCreateProcess(), { wrapper });
      await act(async () => { await expect(result.current.mutateAsync(REQUEST)).resolves.toBe(created); });
      expect(infra.createProcess).toHaveBeenCalledWith(REQUEST);
      expect(spy).toHaveBeenCalledWith({ queryKey: [PROCESS_LIST_QUERY_KEY] });
      expect(spy).toHaveBeenCalledWith({ queryKey: [AVAILABLE_CANDIDATES_QUERY_KEY] });
    });

    it('should expose the error and not invalidate', async () => {
      vi.mocked(infra.createProcess).mockRejectedValue(new Error('boom'));
      const { client, wrapper } = setup();
      const spy = vi.spyOn(client, 'invalidateQueries');
      const { result } = renderHook(() => useCreateProcess(), { wrapper });
      await act(async () => { await result.current.mutateAsync(REQUEST).catch(() => undefined); });
      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(spy).not.toHaveBeenCalled();
    });
  });
});
