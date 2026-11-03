import type {
  IAttentionItem,
  IDashboardSummary,
  ITodayInterview,
} from '../types/processes.types';
import { MOCK_TODAY_INTERVIEWS } from './interviews.mocks';
import { MOCK_ATTENTION, MOCK_PENDING_FEEDBACK } from './processes.mocks';

// Mock-first (PROC-2 las cambia por httpClient sin tocar la firma).
export function fetchDashboardSummary(): Promise<IDashboardSummary> {
  return Promise.resolve({
    interviewsToday: MOCK_TODAY_INTERVIEWS.length,
    pendingFeedback: MOCK_PENDING_FEEDBACK,
  });
}

export function fetchTodayInterviews(): Promise<readonly ITodayInterview[]> {
  return Promise.resolve(MOCK_TODAY_INTERVIEWS);
}

export function fetchAttentionItems(): Promise<readonly IAttentionItem[]> {
  return Promise.resolve(MOCK_ATTENTION);
}
