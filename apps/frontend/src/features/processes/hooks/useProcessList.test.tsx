import { renderHook, waitFor } from '@testing-library/react';
import * as infra from '../infrastructure/processList.infra';
import { createWrapper } from '../test-utils';
import { useProcessDetail } from './useProcessDetail';
import { useProcessList } from './useProcessList';

vi.mock('../infrastructure/processList.infra');

describe('process list hooks', () => {
  beforeEach(() => vi.resetAllMocks());

  it('should load the list with the given params', async () => {
    vi.mocked(infra.fetchProcessList).mockResolvedValue({ data: [], total: 0, page: 2, limit: 10, totalPages: 0 });
    const { result } = renderHook(() => useProcessList({ page: 2, limit: 10 }), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(infra.fetchProcessList).toHaveBeenCalledWith({ page: 2, limit: 10 });
  });

  it('should load a detail by id', async () => {
    vi.mocked(infra.fetchProcessDetail).mockResolvedValue({} as never);
    const { result } = renderHook(() => useProcessDetail('p1'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(infra.fetchProcessDetail).toHaveBeenCalledWith('p1');
  });
});

describe('useProcessList enabled option', () => {
  beforeEach(() => vi.resetAllMocks());

  it('should not call the infra when disabled', () => {
    renderHook(() => useProcessList({ limit: 1 }, { enabled: false }), { wrapper: createWrapper() });
    expect(infra.fetchProcessList).not.toHaveBeenCalled();
  });
});
