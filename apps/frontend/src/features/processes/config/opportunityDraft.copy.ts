import type { TOpportunityDraftErrorCode } from '@ibm-talent-bridge/shared-types';
import { formatFileSize, formatSizeLimit } from '@shared/utils/formatFileSize';
import { OPPORTUNITY_SOURCE_MAX_FILE_BYTES } from './opportunitySource.constants';

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
  suggestedBadge: 'Sugerido por ICA',
  missingHint:    'La IA no pudo inferirlo: complétalo',
  missingNotice:  (labels: readonly string[]): string => `Por completar (la IA no pudo inferirlos): ${labels.join(', ')}.`,
  skippedNotice:  (labels: readonly string[]): string => `No sobrescrito (ya tenía valor): ${labels.join(', ')}.`,
  appliedNotice:  'Revisa los campos marcados «Sugerido por ICA» antes de continuar.',
  brochure: {
    fileLabel: 'Archivo del brochure',
    prompt: 'O arrastra un brochure aquí o haz clic para seleccionar',
    supported: (limit: string): string => `Formatos soportados: PDF, DOCX, MD o TXT (máximo ${limit})`,
  },
  fileErrors: {
    type: 'Solo se aceptan archivos PDF, DOCX, MD o TXT.',
    empty: 'El archivo está vacío.',
    tooLarge: (bytes: number): string =>
      `El archivo pesa ${formatFileSize(bytes)} y el máximo es ${formatSizeLimit(OPPORTUNITY_SOURCE_MAX_FILE_BYTES)}.`,
  },
  fieldLabels: {
    title: 'Título', clientName: 'Cliente', opportunityRole: 'Rol de la oportunidad', skills: 'Stack tecnológico',
    roleDescription: 'Expectativas de evaluación técnica', band: 'Banda', startDate: 'Fecha de inicio',
  },
  errors: {
    AI_UNAVAILABLE: 'El asistente de IA no está disponible en este momento. Puedes completar el formulario a mano o reintentar.',
    AI_TIMEOUT: 'El asistente de IA tardó demasiado en responder. Puedes completar el formulario a mano o reintentar.',
    OPPORTUNITY_TEXT_TOO_LONG: 'El texto es demasiado largo.',
    OPPORTUNITY_SOURCE_UNREADABLE: 'No pudimos leer el documento. Prueba con otro archivo o completa el formulario a mano.',
    NETWORK: 'No se pudo conectar con el servidor. Revisa tu conexión y reintenta.',
    UNKNOWN: 'No se pudo generar el borrador. Revisa el texto, reintenta o completa el formulario a mano.',
  } satisfies Readonly<Record<TDraftFailureKind, string>>,
} as const;
