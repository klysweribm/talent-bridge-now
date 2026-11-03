import type { ICandidateDirectoryEntry, TCandidateAssignOutcome } from '../../domain/interfaces/candidate-directory.interface';

/** Puerto de salida hacia candidatos: procesos nunca toca su colección (ADR-013). */
export interface ICandidateDirectoryPort {
  /** Solo los ids que existen, en el orden pedido. Un id mal formado se trata como inexistente. */
  findByIds(ids: readonly string[]): Promise<readonly ICandidateDirectoryEntry[]>;
  /** Marca `processId` solo si el candidato está libre (atómico por documento). */
  assign(candidateId: string, processId: string): Promise<TCandidateAssignOutcome>;
  /** Libera `processId` solo si coincide. `false` si no había nada que liberar. */
  release(candidateId: string, processId: string): Promise<boolean>;
}
