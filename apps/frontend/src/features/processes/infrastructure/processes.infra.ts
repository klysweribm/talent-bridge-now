import type {
  IActiveProcessesPage,
  IAttentionItem,
  IDashboardSummary,
  ITodayInterview,
} from '../types/processes.types';
import { MOCK_TODAY_INTERVIEWS } from './interviews.mocks';
import { MOCK_ATTENTION, MOCK_PENDING_FEEDBACK, MOCK_PROCESSES } from './processes.mocks';

// Mock-first (PROC-2 las cambia por httpClient sin tocar la firma).
export function fetchDashboardSummary(): Promise<IDashboardSummary> {
  return Promise.resolve({
    activeProcesses: MOCK_PROCESSES.length,
    interviewsToday: MOCK_TODAY_INTERVIEWS.length,
    pendingFeedback: MOCK_PENDING_FEEDBACK,
  });
}

export function fetchActiveProcesses(limit: number): Promise<IActiveProcessesPage> {
  return Promise.resolve({ items: MOCK_PROCESSES.slice(0, limit), total: MOCK_PROCESSES.length });
}

export function fetchTodayInterviews(): Promise<readonly ITodayInterview[]> {
  return Promise.resolve(MOCK_TODAY_INTERVIEWS);
}

export function fetchAttentionItems(): Promise<readonly IAttentionItem[]> {
  return Promise.resolve(MOCK_ATTENTION);
}
