import {
  fetchAttentionItems,
  fetchDashboardSummary,
  fetchTodayInterviews,
} from './processes.infra';

describe('processes.infra (mock-first)', () => {
  it('should return consistent mock summary counters (no process total)', async () => {
    const summary = await fetchDashboardSummary();
    const interviews = await fetchTodayInterviews();
    expect(summary).not.toHaveProperty('activeProcesses');
    expect(summary.interviewsToday).toBe(interviews.length);
    expect(summary.pendingFeedback).toBeGreaterThanOrEqual(0);
  });

  it('should return attention items of both kinds', async () => {
    const items = await fetchAttentionItems();
    expect(items.map(i => i.kind)).toEqual(expect.arrayContaining(['no_referent', 'overdue_feedback']));
  });
});
