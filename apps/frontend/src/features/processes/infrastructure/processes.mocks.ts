import type { IAttentionItem } from '../types/processes.types';

export const MOCK_PENDING_FEEDBACK = 4;

export const MOCK_ATTENTION: readonly IAttentionItem[] = [
  { id: 'a1', kind: 'no_referent', processId: '5', processTitle: 'SRE Senior' },
  { id: 'a2', kind: 'overdue_feedback', processId: '1', processTitle: 'Desarrollador React & Node.js Senior', candidateName: 'Sergio Vega', hoursOverdue: 52 },
];
