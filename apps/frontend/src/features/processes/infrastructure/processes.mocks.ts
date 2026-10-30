import type { IAttentionItem, IProcessSummary } from '../types/processes.types';

export const MOCK_PROCESSES: readonly IProcessSummary[] = [
  { id: '1', title: 'Desarrollador React & Node.js Senior', client: 'Banco Santander', stage: 'Entrevista Técnica', candidatesCount: 7, health: 'on_track' },
  { id: '2', title: 'Arquitecto Cloud AWS / IBM Cloud', client: 'Telefónica', stage: '1ra Entrevista', candidatesCount: 4, health: 'at_risk' },
  { id: '3', title: 'Data Engineer — Pipeline & MLOps', client: 'Claro Colombia', stage: 'Inicial', candidatesCount: 12, health: 'on_track' },
  { id: '4', title: 'QA Automation Lead', client: 'Banco Santander', stage: 'Entrevista con Cliente', candidatesCount: 3, health: 'on_track' },
  { id: '5', title: 'SRE Senior', client: 'Telefónica', stage: 'Inicial', candidatesCount: 1, health: 'at_risk' },
  { id: '6', title: 'Product Owner Fintech', client: 'Claro Colombia', stage: 'Cierre', candidatesCount: 2, health: 'on_track' },
];

export const MOCK_PENDING_FEEDBACK = 4;

export const MOCK_ATTENTION: readonly IAttentionItem[] = [
  { id: 'a1', kind: 'no_referent', processId: '5', processTitle: 'SRE Senior' },
  { id: 'a2', kind: 'overdue_feedback', processId: '1', processTitle: 'Desarrollador React & Node.js Senior', candidateName: 'Sergio Vega', hoursOverdue: 52 },
];
