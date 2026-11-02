import { Inject, Injectable } from '@nestjs/common';
import type { ICandidate, ICandidateListItem, PaginatedResponse, TCandidateAssignment } from '@ibm-talent-bridge/shared-types';
import { CANDIDATE_REPOSITORY_PORT } from '../../domain/constants/candidate.constants';
import type { ICandidateRepositoryPort } from '../ports/candidate-repository.port';

/** Solo lo necesario para elegir a quién asociar: nunca teléfono ni datos del CV. */
export const toListItem = ({ id, fullName, email, primaryRole, processId, createdAt }: ICandidate): ICandidateListItem => ({
  id, fullName, email, ...(primaryRole ? { primaryRole } : {}), ...(processId ? { processId } : {}), createdAt,
});

/** Sin logs: maneja nombre y correo de candidatos. */
@Injectable()
export class CandidateListService {
  constructor(@Inject(CANDIDATE_REPOSITORY_PORT) private readonly repository: ICandidateRepositoryPort) {}

  async list(page: number, limit: number, assignment?: TCandidateAssignment): Promise<PaginatedResponse<ICandidateListItem>> {
    const { items, total } = await this.repository.findPage(page, limit, assignment);
    return { data: items.map(toListItem), total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
