// PROCESSES — proceso de selección con 1 a N candidatos, un PM y un reclutador únicos (PROC-1). Solo tipos.
// El límite de candidatos vive en el backend (`MAX_CANDIDATES_PER_PROCESS`) y viaja en cada respuesta.

import type { ICandidateActor } from './candidates';
import type { IUserProfile } from './users';

/** Límites de procesos que el formulario necesita antes de que exista un proceso. */
export interface IProcessLimits {
  readonly maxCandidates: number;
}

/**
 * Estado del proceso (PROC-1b). `closed` y `cancelled` son terminales. Distinto del legado `ProcessStatus`
 * ('active'|'paused'|'closed') de `index.ts`, que sigue ligado al tipo `Process` antiguo.
 */
export type TProcessStatus = 'open' | 'in_progress' | 'interviewing' | 'closed' | 'cancelled';

/** Proceso persistido. `recruiterId` es null cuando el PM no eligió reclutador: solo el PM dueño gestiona candidatos. */
export interface IProcess {
  readonly id: string;
  readonly title: string;
  readonly clientName: string;
  readonly ownerPmId: string;
  readonly recruiterId: string | null;
  readonly status: TProcessStatus;
  /** Campos de la oportunidad (PROC-1c). Los procesos anteriores a PROC-1c no los tienen: se leen como '' / [] / null. */
  readonly opportunityRole: string;
  readonly skills: readonly string[];
  readonly roleDescription: string;
  /** Banda de la oportunidad (entera); `null` solo en procesos legacy sin banda. Al escribir es siempre un entero. */
  readonly band: number | null;
  readonly candidateIds: readonly string[];
  /** Referentes técnicos asignados (máx. 2); los procesos anteriores no lo tienen: se leen como []. */
  readonly technicalRefIds: readonly string[];
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
  readonly opportunityRole: string;
  readonly skills: readonly string[];
  readonly roleDescription: string;
  readonly band: number;
  readonly ownerPmId?: string;
  readonly recruiterId?: string;
  readonly candidateIds?: readonly string[];
}

/** `PATCH /processes/:id`: todos los campos son opcionales. Solo el PM dueño puede cambiar `recruiterId`. */
export interface IUpdateProcessRequest {
  readonly title?: string;
  readonly clientName?: string;
  readonly opportunityRole?: string;
  readonly skills?: readonly string[];
  readonly roleDescription?: string;
  readonly band?: number;
  readonly recruiterId?: string;
  readonly status?: TProcessStatus;
  /** Reemplaza el conjunto de referentes técnicos (máx. 2, activos); `[]` los quita todos. */
  readonly technicalRefIds?: readonly string[];
}

/** Referente técnico resumido en la lista de procesos: solo lo necesario para mostrarlo (sin email, banda ni descripción). */
export interface IProcessListTechnicalRef {
  readonly id: string;
  readonly fullName: string;
  readonly avatarUrl?: string;
}

/** Fila de `GET /processes`. */
export interface IProcessListItem extends Omit<IProcess, 'candidateIds'> {
  readonly candidateCount: number;
  /** En el orden de `technicalRefIds`; un referente que ya no existe se omite. Procesos legacy: []. */
  readonly technicalRefs: readonly IProcessListTechnicalRef[];
}

/** Candidato resumido dentro del detalle de un proceso (nunca el documento completo). */
export interface IProcessCandidateSummary {
  readonly id: string;
  readonly fullName: string;
  readonly primaryRole?: string;
}

/** Ficha completa de un referente técnico asignado a un proceso. */
export interface IProcessTechnicalRef extends IUserProfile {}

/** `GET /processes/:id`. */
export interface IProcessDetail extends IProcess {
  readonly candidates: readonly IProcessCandidateSummary[];
  /** En el orden de `technicalRefIds`; un referente que ya no existe se omite. */
  readonly technicalRefs: readonly IProcessTechnicalRef[];
}

/** `POST /processes/:id/candidates`. */
export interface IAddProcessCandidateRequest {
  readonly candidateId: string;
}

/** Opción de selector de `GET /users?role=pm|recruiter|technical_ref`: solo id y nombre. */
export interface IUserOption {
  readonly id: string;
  readonly fullName: string;
  /** Solo en `role=technical_ref`, y solo si el usuario tiene banda. */
  readonly band?: number;
}
