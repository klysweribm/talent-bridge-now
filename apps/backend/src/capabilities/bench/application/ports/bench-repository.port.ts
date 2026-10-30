import type { IBenchResource, TBenchStatus } from '@ibm-talent-bridge/shared-types';
import type { IBenchFilters } from '../../domain/interfaces/bench-filters.interface';

/**
 * Puerto de salida hacia la persistencia del bench. `BenchService` y el seeder
 * dependen solo de esta abstracción; el adapter Mongoose vive en
 * `infrastructure/adapters/mongoose-bench.adapter.ts`.
 */
export interface IBenchRepositoryPort {
  findPaginated(filters: IBenchFilters, page: number, limit: number): Promise<readonly IBenchResource[]>;
  count(filters: IBenchFilters): Promise<number>;
  findByCode(benchCode: string): Promise<IBenchResource | null>;
  /** Nombres de skill (distintos, ordenados) solo de recursos en alguno de `statuses`. */
  listSkillNames(statuses: readonly TBenchStatus[]): Promise<readonly string[]>;
  /** Idempotente por `benchCode`. Devuelve cuántos recursos procesó. */
  upsertMany(resources: readonly Omit<IBenchResource, 'id'>[]): Promise<number>;
}

export const BENCH_REPOSITORY_PORT = Symbol('BENCH_REPOSITORY_PORT');
