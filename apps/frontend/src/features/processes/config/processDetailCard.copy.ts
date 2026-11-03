export const PROCESS_DETAIL_CARD_COPY = {
  organization: 'IBM CONSULTING LATAM',
  client:       'Cliente',
  band:         'Banda profesional',
  bandValue:    (band: number): string => `Band ${band}`,
  stack:        'Stack tecnológico requerido',
  expectations: 'Expectativas de evaluación técnica',
} as const;
