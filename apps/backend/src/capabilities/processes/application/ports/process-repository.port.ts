import type { INewProcess, IProcessChanges, TProcessRecord } from '../../domain/interfaces/process-record.interface';

export interface IProcessRepositoryPort {
  create(process: INewProcess): Promise<TProcessRecord>;
  /** Un id mal formado se trata como inexistente (`null`), nunca como error. */
  findById(id: string): Promise<TProcessRecord | null>;
  findPaginated(page: number, limit: number): Promise<readonly TProcessRecord[]>;
  count(): Promise<number>;
  /** Agrega con `$addToSet` solo si hay cupo (< `max`) y no estaba: atómico bajo concurrencia. `false` = no se agregó. */
  addCandidate(id: string, candidateId: string, max: number): Promise<boolean>;
  /** Quita el id del proceso. `false` si no estaba. */
  removeCandidate(id: string, candidateId: string): Promise<boolean>;
  /** Aplica los cambios y devuelve el proceso actualizado; `null` si no existe. */
  update(id: string, changes: IProcessChanges): Promise<TProcessRecord | null>;
  /** Borra el proceso (solo para revertir una creación fallida). */
  delete(id: string): Promise<void>;
}
