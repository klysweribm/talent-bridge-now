import {
  fetchActiveProcesses,
  fetchAttentionItems,
  fetchDashboardSummary,
  fetchTodayInterviews,
} from './processes.infra';

describe('processes.infra (mock-first)', () => {
  it('should return consistent summary counters', async () => {
    const summary = await fetchDashboardSummary();
    const interviews = await fetchTodayInterviews();
    const all = await fetchActiveProcesses(100);
    expect(summary.activeProcesses).toBe(all.total);
    expect(summary.interviewsToday).toBe(interviews.length);
    expect(summary.pendingFeedback).toBeGreaterThanOrEqual(0);
  });

  it('should cap items at the requested limit and keep the total', async () => {
    const page = await fetchActiveProcesses(5);
    expect(page.items).toHaveLength(5);
    expect(page.total).toBeGreaterThan(5);
  });

  it('should return attention items of both kinds', async () => {
    const items = await fetchAttentionItems();
    expect(items.map(i => i.kind)).toEqual(expect.arrayContaining(['no_referent', 'overdue_feedback']));
  });
});
