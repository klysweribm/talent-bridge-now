import type { TOpportunityDraftErrorCode } from '@ibm-talent-bridge/shared-types';

export const OPPORTUNITY_DRAFT_CONFIG = Symbol('OPPORTUNITY_DRAFT_CONFIG');

/** Nombres de las variables de entorno (los valores viven en `.env.example` y en el compose). */
export const OPPORTUNITY_DRAFT_MAX_TEXT_ENV = 'OPPORTUNITY_DRAFT_MAX_TEXT_CHARS';
export const OPPORTUNITY_DRAFT_TIMEOUT_ENV = 'OPPORTUNITY_DRAFT_TIMEOUT_MS';

/** Throttle de `POST /ai/opportunity-draft`: una sola definición, la usan el controller y su test. */
export const OPPORTUNITY_DRAFT_THROTTLE_LIMIT = 10;
export const OPPORTUNITY_DRAFT_THROTTLE_TTL_MS = 60_000;

/** Status HTTP por código. El frontend ramifica por `code`; el status solo ayuda a distinguirlos en el log. */
export const OPPORTUNITY_DRAFT_HTTP_STATUS: Readonly<Record<TOpportunityDraftErrorCode, number>> = {
  AI_UNAVAILABLE: 503,
  AI_TIMEOUT: 504,
  OPPORTUNITY_TEXT_TOO_LONG: 400,
};

export const OPPORTUNITY_DRAFT_MESSAGES = {
  unavailable: 'La IA no está disponible en este momento. Puedes completar el formulario manualmente.',
  timeout: 'La IA tardó demasiado en responder. Puedes completar el formulario manualmente.',
  tooLong: (maxChars: number): string => `El texto supera el máximo de ${maxChars} caracteres`,
  textRequired: 'El texto de la oportunidad es obligatorio',
} as const;

/** Etiqueta que delimita el texto del usuario en el prompt: son datos, nunca instrucciones. */
export const OPPORTUNITY_TEXT_OPEN_TAG = '<oportunidad>';
export const OPPORTUNITY_TEXT_CLOSE_TAG = '</oportunidad>';
