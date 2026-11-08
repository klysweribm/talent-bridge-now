export const PROCESS_CREATE_STEPS = ['data', 'candidates', 'confirm'] as const;
export type TProcessCreateStep = (typeof PROCESS_CREATE_STEPS)[number];

/** Mismo tope que valida el backend para título y cliente. */
export const PROCESS_TEXT_MAX_LENGTH = 200;

export const AVAILABLE_CANDIDATES_QUERY_KEY = 'available-candidates';
export const USER_OPTIONS_QUERY_KEY = 'user-options';
export const PROCESS_LIMITS_QUERY_KEY = 'process-limits';

export const HTTP_BAD_REQUEST = 400;
export const HTTP_FORBIDDEN = 403;
export const HTTP_NOT_FOUND = 404;
export const HTTP_CONFLICT = 409;
export const HTTP_UNAVAILABLE = 503;

export const PROCESS_CREATE_ERRORS = {
  candidateAlreadyAssigned: 'Uno o más candidatos ya pertenecen a otra oportunidad.',
  candidateLimitExceeded:   'Superaste el máximo de candidatos permitido para una oportunidad.',
  candidateNotFound:        'Uno o más candidatos seleccionados ya no existen.',
  serviceUnavailable:       'No se pudo crear la oportunidad en este momento. No se guardó ningún cambio; intenta de nuevo.',
} as const;

export const PROCESS_DATA_ERRORS = {
  titleRequired:    'El título es obligatorio.',
  titleTooLong:     `El título admite hasta ${PROCESS_TEXT_MAX_LENGTH} caracteres.`,
  clientRequired:   'El cliente es obligatorio.',
  clientTooLong:    `El cliente admite hasta ${PROCESS_TEXT_MAX_LENGTH} caracteres.`,
  ownerPmRequired:  'Elige el PM responsable de la oportunidad.',
} as const;

/** Tamaño de página de los selectores de PM/reclutador (máximo del backend). */
export const USER_OPTIONS_PAGE_LIMIT = 50;
