/** Vista mínima de un candidato para otras capabilities: sin contacto ni perfil completo. */
export interface ICandidateProcessSummary {
  readonly id: string;
  readonly fullName: string;
  readonly primaryRole?: string;
  /** Ausente = disponible. */
  readonly processId?: string;
}

export type TProcessClaimOutcome = 'assigned' | 'already-assigned' | 'taken' | 'missing';
