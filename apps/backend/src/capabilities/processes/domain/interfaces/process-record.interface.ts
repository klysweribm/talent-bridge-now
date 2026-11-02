import type { ICandidateActor, IProcess } from '@ibm-talent-bridge/shared-types';

/** Proceso tal como lo persiste el repositorio: sin `maxCandidates`, que es configuración y no dato. */
export type TProcessRecord = Omit<IProcess, 'maxCandidates'>;

/** Datos para crear un proceso; el repositorio asigna id y fechas. */
export interface INewProcess {
  readonly title: string;
  readonly clientName: string;
  readonly ownerPmId: string;
  readonly recruiterId: string | null;
  readonly createdBy: ICandidateActor;
  /** Ids ya validados que nacen asociados (PROC-1-B); ausente = ninguno. */
  readonly candidateIds?: readonly string[];
}
