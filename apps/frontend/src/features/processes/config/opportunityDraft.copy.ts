import type { TOpportunityDraftErrorCode } from '@ibm-talent-bridge/shared-types';

/** Fallos del borrador sin `code` del servidor (validación del DTO, red caída, respuesta inesperada). */
export type TDraftFailureKind = TOpportunityDraftErrorCode | 'UNKNOWN' | 'NETWORK';

export const DRAFT_COPY = {
  boxLabel:       'Describe la oportunidad con tus palabras',
  boxHint:        'Pega el correo o el pedido del cliente. La IA propone los campos del formulario; no se crea nada hasta que pulses «Crear oportunidad».',
  boxPlaceholder: 'Ej.: Necesitamos un fullstack para ITAU, React y NestJS, banda 8, desde el 1 de diciembre.',
  generate:       'Generar con IA',
  noticesLabel:   'Avisos del borrador de IA',
  generating:     'Generando…',
  retry:          'Reintentar',
  suggestedBadge: 'Sugerido por IA',
  missingHint:    'La IA no pudo inferirlo: complétalo',
  missingNotice:  (labels: readonly string[]): string => `Por completar (la IA no pudo inferirlos): ${labels.join(', ')}.`,
  skippedNotice:  (labels: readonly string[]): string => `No sobrescrito (ya tenía valor): ${labels.join(', ')}.`,
  appliedNotice:  'Revisa los campos marcados «Sugerido por IA» antes de continuar.',
  fieldLabels: {
    title: 'Título', clientName: 'Cliente', opportunityRole: 'Rol de la oportunidad', skills: 'Stack tecnológico',
    roleDescription: 'Expectativas de evaluación técnica', band: 'Banda', startDate: 'Fecha de inicio',
  },
  errors: {
    AI_UNAVAILABLE: 'El asistente de IA no está disponible en este momento. Puedes completar el formulario a mano o reintentar.',
    AI_TIMEOUT: 'El asistente de IA tardó demasiado en responder. Puedes completar el formulario a mano o reintentar.',
    OPPORTUNITY_TEXT_TOO_LONG: 'El texto es demasiado largo.',
    NETWORK: 'No se pudo conectar con el servidor. Revisa tu conexión y reintenta.',
    UNKNOWN: 'No se pudo generar el borrador. Revisa el texto, reintenta o completa el formulario a mano.',
  } satisfies Readonly<Record<TDraftFailureKind, string>>,
} as const;
