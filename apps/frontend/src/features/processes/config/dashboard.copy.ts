export const DASHBOARD_COPY = {
  title:           'Inicio',
  newProcess:      'Nueva oportunidad',
  addCandidate:    'Agregar candidato',
  summaryLabel:    'Resumen',
  noValue:         '—',
  comingSoon:      'Próximamente',
  interviewsToday: 'Entrevistas hoy',
  pendingFeedback: 'Feedback pendiente',
  attentionTitle:  'Requiere atención',
  attentionEmpty:  'Las alertas aparecerán cuando se activen entrevistas y feedback',
  todayTitle:      'Entrevistas de hoy',
  todayEmpty:      'El agendamiento de entrevistas estará disponible próximamente',
} as const;

export const DASHBOARD_PATHS = {
  interviewsToday: '/interviews?date=today',
  pendingFeedback: '/feedback?status=pending',
} as const;
