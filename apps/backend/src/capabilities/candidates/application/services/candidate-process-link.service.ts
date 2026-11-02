import { Inject, Injectable } from '@nestjs/common';
import type { ICandidate, PaginatedResponse } from '@ibm-talent-bridge/shared-types';
import { CANDIDATE_REPOSITORY_PORT } from '../../domain/constants/candidate.constants';
import type { ICandidateProcessSummary, TProcessClaimOutcome } from '../../domain/interfaces/candidate-process-summary.interface';
import type { ICandidateRepositoryPort } from '../ports/candidate-repository.port';

const summarize = ({ id, fullName, primaryRole, processId }: ICandidate): ICandidateProcessSummary => ({
  id, fullName, ...(primaryRole ? { primaryRole } : {}), ...(processId ? { processId } : {}),
});

/** Fachada que `ProcessesModule` consume por llamada en memoria (ADR-013). Sin logs: no maneja datos personales. */
@Injectable()
export class CandidateProcessLinkService {
  constructor(@Inject(CANDIDATE_REPOSITORY_PORT) private readonly repository: ICandidateRepositoryPort) {}

  async findSummaries(ids: readonly string[]): Promise<readonly ICandidateProcessSummary[]> {
    if (ids.length === 0) return [];
    return (await this.repository.findByIds(ids)).map(summarize);
  }

  /** Marca el proceso solo si el candidato está libre; si no cambia nada, distingue el motivo. */
  async assign(candidateId: string, processId: string): Promise<TProcessClaimOutcome> {
    if (await this.repository.claimProcess(candidateId, processId)) return 'assigned';
    const [current] = await this.repository.findByIds([candidateId]);
    if (!current) return 'missing';
    return current.processId === processId ? 'already-assigned' : 'taken';
  }

  release(candidateId: string, processId: string): Promise<boolean> {
    return this.repository.releaseProcess(candidateId, processId);
  }

  async listAvailable(page: number, limit: number): Promise<PaginatedResponse<ICandidateProcessSummary>> {
    const { items, total } = await this.repository.findPage(page, limit, 'available');
    return { data: items.map(summarize), total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
