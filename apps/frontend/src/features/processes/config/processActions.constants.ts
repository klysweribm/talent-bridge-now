/** Códigos estables del cuerpo de error `{ statusCode, code, message }` del backend (DT-040). */
export const PROCESS_ERROR_CODES = {
  terminalState:            'PROCESS_TERMINAL_STATE',
  candidateLimit:           'PROCESS_CANDIDATE_LIMIT',
  candidateAlreadyAssigned: 'CANDIDATE_ALREADY_ASSIGNED',
  releaseFailed:            'PROCESS_RELEASE_FAILED',
} as const;

export const PROCESS_ACTION_ERRORS = {
  terminalState:            'El proceso ya está cerrado o cancelado y no admite más cambios.',
  candidateLimit:           'Superaste el máximo de candidatos permitido para un proceso.',
  candidateAlreadyAssigned: 'Uno o más candidatos ya pertenecen a otro proceso.',
  releaseFailed:            'No se pudieron liberar los candidatos; el proceso no se canceló. Intenta de nuevo.',
  serviceUnavailable:       'No se pudo guardar el cambio en este momento. No se modificó nada; intenta de nuevo.',
  forbidden:                'No tienes permiso para realizar esta acción en este proceso.',
  notFound:                 'El proceso o el candidato ya no existe.',
  generic:                  'No se pudo completar la acción. Intenta de nuevo.',
} as const;
