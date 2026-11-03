import { renderHook, waitFor } from '@testing-library/react';
import { createWrapper } from '../test-utils';
import { useAttentionItemsQuery } from './useAttentionItemsQuery';
import { useDashboardSummaryQuery } from './useDashboardSummaryQuery';
import { useTodayInterviewsQuery } from './useTodayInterviewsQuery';

describe('processes query hooks', () => {
  it('should load the dashboard summary', async () => {
    const { result } = renderHook(() => useDashboardSummaryQuery(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.pendingFeedback).toBeGreaterThanOrEqual(0);
  });

  it('should load today interviews', async () => {
    const { result } = renderHook(() => useTodayInterviewsQuery(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.length).toBeGreaterThan(0);
  });

  it('should load attention items', async () => {
    const { result } = renderHook(() => useAttentionItemsQuery(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.length).toBeGreaterThan(0);
  });
});
