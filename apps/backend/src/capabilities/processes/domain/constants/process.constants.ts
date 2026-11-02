import type { TProcessStatus } from '@ibm-talent-bridge/shared-types';

export const PROCESS_REPOSITORY_PORT = Symbol('PROCESS_REPOSITORY_PORT');
export const PROCESSES_CONFIG = Symbol('PROCESSES_CONFIG');

export const PROCESS_TITLE_MAX = 200;
export const PROCESS_CLIENT_NAME_MAX = 200;
export const PROCESS_OPPORTUNITY_ROLE_MAX = 200;
export const PROCESS_ROLE_DESCRIPTION_MAX = 2000;
/** Tecnologías requeridas: entre 1 y `PROCESS_SKILLS_MAX`, cada una de hasta `PROCESS_SKILL_MAX` caracteres. */
export const PROCESS_SKILLS_MIN = 1;
export const PROCESS_SKILLS_MAX = 15;
export const PROCESS_SKILL_MAX = 60;
/** Banda de la oportunidad: entero entre ambos valores (inclusive). */
export const PROCESS_BAND_MIN = 6;
export const PROCESS_BAND_MAX = 10;
/** Máximo de referentes técnicos asignados a un proceso. */
export const PROCESS_TECHNICAL_REFS_MAX = 2;
/** Tope de ids aceptados en `candidateIds` . */
export const PROCESS_CANDIDATE_IDS_MAX = 50;

/** Tope de candidatos por proceso si `MAX_CANDIDATES_PER_PROCESS` falta o es inválida. */
export const DEFAULT_MAX_CANDIDATES_PER_PROCESS = 5;

export const CANDIDATE_DIRECTORY_PORT = Symbol('CANDIDATE_DIRECTORY_PORT');

export const PROCESS_STATUSES: readonly TProcessStatus[] = ['open', 'in_progress', 'interviewing', 'closed', 'cancelled'];
export const DEFAULT_PROCESS_STATUS: TProcessStatus = 'open';
/** Estados de los que no se sale: no admiten cambios ni gestión de candidatos. */
export const TERMINAL_PROCESS_STATUSES: readonly TProcessStatus[] = ['closed', 'cancelled'];

/** Códigos estables en el cuerpo de error `{ statusCode, code, message }` (DT-040): el front no depende del texto. */
export const PROCESS_ERROR_CODES = {
  terminalState: 'PROCESS_TERMINAL_STATE',
  candidateLimit: 'PROCESS_CANDIDATE_LIMIT',
  candidateAlreadyAssigned: 'CANDIDATE_ALREADY_ASSIGNED',
  releaseFailed: 'PROCESS_RELEASE_FAILED',
  invalidTechnicalRef: 'PROCESS_INVALID_TECHNICAL_REF',
} as const;
