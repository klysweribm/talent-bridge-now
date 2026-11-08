/** Códigos estables del cuerpo de error `{ statusCode, code, message }` del backend (DT-040). */
export const PROCESS_ERROR_CODES = {
  terminalState:            'PROCESS_TERMINAL_STATE',
  candidateLimit:           'PROCESS_CANDIDATE_LIMIT',
  candidateAlreadyAssigned: 'CANDIDATE_ALREADY_ASSIGNED',
  releaseFailed:            'PROCESS_RELEASE_FAILED',
  invalidTechnicalRef:      'PROCESS_INVALID_TECHNICAL_REF',
} as const;

export const PROCESS_ACTION_ERRORS = {
  terminalState:            'La oportunidad ya está cerrada o cancelada y no admite más cambios.',
  candidateLimit:           'Superaste el máximo de candidatos permitido para una oportunidad.',
  candidateAlreadyAssigned: 'Uno o más candidatos ya pertenecen a otra oportunidad.',
  releaseFailed:            'No se pudieron liberar los candidatos; la oportunidad no se canceló. Intenta de nuevo.',
  invalidTechnicalRef:      'Alguno de los referentes técnicos ya no está disponible. Actualiza la lista y elige de nuevo.',
  serviceUnavailable:       'No se pudo guardar el cambio en este momento. No se modificó nada; intenta de nuevo.',
  forbidden:                'No tienes permiso para realizar esta acción en esta oportunidad.',
  notFound:                 'La oportunidad o el candidato ya no existe.',
  generic:                  'No se pudo completar la acción. Intenta de nuevo.',
} as const;
