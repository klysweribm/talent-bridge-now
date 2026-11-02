// PROCESSES — proceso de selección con 1 a N candidatos, un PM y un reclutador únicos (PROC-1). Solo tipos.
// El límite de candidatos vive en el backend (`MAX_CANDIDATES_PER_PROCESS`) y viaja en cada respuesta.

import type { ICandidateActor } from './candidates';

/** Límites de procesos que el formulario necesita antes de que exista un proceso. */
export interface IProcessLimits {
  readonly maxCandidates: number;
}

/** Proceso persistido. `recruiterId` es null cuando el PM no eligió reclutador: solo el PM dueño gestiona candidatos. */
export interface IProcess {
  readonly id: string;
  readonly title: string;
  readonly clientName: string;
  readonly ownerPmId: string;
  readonly recruiterId: string | null;
  readonly candidateIds: readonly string[];
  readonly maxCandidates: number;
  readonly createdBy: ICandidateActor;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * `POST /processes`. `ownerPmId` es obligatorio solo si crea un reclutador (si crea un PM se ignora y se toma el del JWT).
 * `recruiterId` solo se respeta si crea un PM; si crea un reclutador se toma el suyo.
 */
export interface ICreateProcessRequest {
  readonly title: string;
  readonly clientName: string;
  readonly ownerPmId?: string;
  readonly recruiterId?: string;
  readonly candidateIds?: readonly string[];
}

/** Fila de `GET /processes`. */
export interface IProcessListItem extends Omit<IProcess, 'candidateIds'> {
  readonly candidateCount: number;
}

/** Candidato resumido dentro del detalle de un proceso (nunca el documento completo). */
export interface IProcessCandidateSummary {
  readonly id: string;
  readonly fullName: string;
  readonly primaryRole?: string;
}

/** `GET /processes/:id`. */
export interface IProcessDetail extends IProcess {
  readonly candidates: readonly IProcessCandidateSummary[];
}

/** `POST /processes/:id/candidates`. */
export interface IAddProcessCandidateRequest {
  readonly candidateId: string;
}

/** Opción de selector de `GET /users?role=pm|recruiter`: solo id y nombre. */
export interface IUserOption {
  readonly id: string;
  readonly fullName: string;
}
