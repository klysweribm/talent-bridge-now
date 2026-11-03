import type { IProcessCandidateSummary } from '@ibm-talent-bridge/shared-types';

/** Candidato visto desde procesos: el resumen más el proceso al que ya pertenece (ausente = disponible). */
export interface ICandidateDirectoryEntry extends IProcessCandidateSummary {
  readonly processId?: string;
}

/** `assigned` = quedó marcado; `already-assigned` = ya era de ese proceso; `taken` = es de otro; `missing` = no existe. */
export type TCandidateAssignOutcome = 'assigned' | 'already-assigned' | 'taken' | 'missing';
