import type { ICandidate, ICandidateActor, TCandidateAssignment, ICreateCandidateRequest, TCandidateStatus } from '@ibm-talent-bridge/shared-types';

export interface ICandidateSimilarQuery {
  readonly nameKey?: string;
  readonly phoneKey?: string;
  /** Email ya normalizado que se excluye (el del propio borrador). */
  readonly excludeEmail: string;
}

/** Puerto de persistencia de candidatos. El email llega ya normalizado (minúsculas, sin espacios). */
export interface ICandidateRepositoryPort {
  findByEmail(email: string): Promise<ICandidate | null>;
  /** Un id mal formado se trata como inexistente (`null`), nunca como error. */
  findById(id: string): Promise<ICandidate | null>;
  /** Candidatos con otro email cuyo `nameKey` o `phoneKey` coincide; acotado por `CANDIDATE_SIMILAR_LIMIT`. */
  findSimilar(query: ICandidateSimilarQuery): Promise<readonly ICandidate[]>;
  /** Lanza `DuplicateCandidateEmailError` si el índice único rechaza el email. Guarda `createdBy` y `updateCount: 0`. */
  create(request: ICreateCandidateRequest, status: TCandidateStatus, actor: ICandidateActor): Promise<ICandidate>;
  /**
   * Reemplazo total de los campos de perfil (los ausentes se eliminan). Conserva email, status, createdBy y createdAt;
   * fija `updatedBy`, recalcula las claves e incrementa `updateCount`. `null` si el id no existe o es inválido.
   */
  replace(id: string, request: ICreateCandidateRequest, actor: ICandidateActor): Promise<ICandidate | null>;
  /** Solo los ids que existen (ids mal formados se ignoran). */
  findByIds(ids: readonly string[]): Promise<readonly ICandidate[]>;
  /** Fija `processId` solo si el candidato no tiene ninguno (update condicional, atómico). `false` si no cambió nada. */
  claimProcess(id: string, processId: string): Promise<boolean>;
  /** Quita `processId` solo si coincide con `processId`. `false` si no cambió nada. */
  releaseProcess(id: string, processId: string): Promise<boolean>;
  /** Candidatos paginados (más recientes primero). `assignment` ausente = todos; `available` = sin `processId`; `assigned` = con él. */
  findPage(page: number, limit: number, assignment?: TCandidateAssignment): Promise<{ readonly items: readonly ICandidate[]; readonly total: number }>;
}
