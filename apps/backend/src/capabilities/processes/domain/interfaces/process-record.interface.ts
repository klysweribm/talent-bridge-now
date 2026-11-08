import type { ICandidateActor, IProcess, TProcessStatus } from '@ibm-talent-bridge/shared-types';

/** Proceso tal como lo persiste el repositorio: sin `maxCandidates`, que es configuración y no dato. */
export type TProcessRecord = Omit<IProcess, 'maxCandidates'>;

/** Cambios parciales de un proceso; `candidateIds` solo se reemplaza al cancelar (vaciar). */
export interface IProcessChanges {
  readonly title?: string;
  readonly clientName?: string;
  readonly opportunityRole?: string;
  readonly skills?: readonly string[];
  readonly roleDescription?: string;
  readonly band?: number;
  readonly startDate?: string;
  readonly recruiterId?: string;
  readonly status?: TProcessStatus;
  readonly candidateIds?: readonly string[];
  /** Reemplaza el conjunto completo (ids ya validados). */
  readonly technicalRefIds?: readonly string[];
}

/** Datos para crear un proceso; el repositorio asigna id y fechas. */
export interface INewProcess {
  readonly title: string;
  readonly clientName: string;
  readonly opportunityRole: string;
  readonly skills: readonly string[];
  readonly roleDescription: string;
  readonly band: number;
  readonly startDate?: string;
  readonly ownerPmId: string;
  readonly recruiterId: string | null;
  readonly createdBy: ICandidateActor;
  /** Ids ya validados que nacen asociados (PROC-1-B); ausente = ninguno. */
  readonly candidateIds?: readonly string[];
}
