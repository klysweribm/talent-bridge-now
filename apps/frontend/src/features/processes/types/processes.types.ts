import type { ProcessStage } from '@/config/design-tokens';

export type TProcessHealth = 'on_track' | 'at_risk';
export type TInterviewStatus = 'confirmed' | 'pending_confirmation';
export type TAttentionKind = 'no_referent' | 'overdue_feedback';

export interface IDashboardSummary {
  readonly activeProcesses: number;
  readonly interviewsToday: number;
  readonly pendingFeedback: number;
}

export interface IProcessSummary {
  readonly id: string;
  readonly title: string;
  readonly client: string;
  readonly stage: ProcessStage;
  readonly candidatesCount: number;
  readonly health: TProcessHealth;
}

export interface IActiveProcessesPage {
  readonly items: readonly IProcessSummary[];
  readonly total: number;
}

export interface ITodayInterview {
  readonly id: string;
  readonly candidateName: string;
  readonly processTitle: string;
  readonly time: string;
  readonly referentName: string;
  readonly status: TInterviewStatus;
  readonly meetingUrl: string;
}

// "Feedback vencido > 48 h" lo calcula el backend (decisión abierta): el
// front solo recibe `hoursOverdue` ya resuelto.
export interface IAttentionItem {
  readonly id: string;
  readonly kind: TAttentionKind;
  readonly processId: string;
  readonly processTitle: string;
  readonly candidateName?: string;
  readonly hoursOverdue?: number;
}
