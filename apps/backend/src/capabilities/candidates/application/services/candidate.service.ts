import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import type { ICandidate, ICandidateActor, ICreateCandidateRequest } from '@ibm-talent-bridge/shared-types';
import { CANDIDATE_REPOSITORY_PORT } from '../../domain/constants/candidate.constants';
import { DuplicateCandidateEmailError } from '../../domain/errors/duplicate-candidate-email.error';
import type { ICandidateRepositoryPort } from '../ports/candidate-repository.port';

@Injectable()
export class CandidateService {
  private readonly logger = new Logger(CandidateService.name);

  constructor(@Inject(CANDIDATE_REPOSITORY_PORT) private readonly repository: ICandidateRepositoryPort) {}

  /** Crea un candidato `tentative`. Email duplicado (insensible a mayúsculas) -> 400 con el candidato existente (UC-CAND-1). */
  async create(request: ICreateCandidateRequest, actor: ICandidateActor): Promise<ICandidate> {
    const normalized = this.normalize(request);
    const existing = await this.repository.findByEmail(normalized.email);
    if (existing) throw this.duplicate(existing);
    try {
      const created = await this.repository.create(normalized, 'tentative', actor);
      this.logger.log(`Candidate created: id=${created.id}`);
      return created;
    } catch (error) {
      if (!(error instanceof DuplicateCandidateEmailError)) throw error;
      // Carrera: otra alta ganó entre la comprobación y el insert; el índice único lo detectó.
      const winner = await this.repository.findByEmail(normalized.email);
      if (winner) throw this.duplicate(winner);
      throw error;
    }
  }

  /** Reemplazo total del perfil (UC-CAND-6). 404 si no existe; 400 si el email difiere del guardado. */
  async update(id: string, request: ICreateCandidateRequest, actor: ICandidateActor): Promise<ICandidate> {
    const normalized = this.normalize(request);
    const current = await this.repository.findById(id);
    if (!current) throw this.notFound(id);
    if (current.email !== normalized.email) {
      this.logger.warn(`Candidate update rejected, email mismatch: id=${id}`);
      throw new BadRequestException('Changing the email is not supported on update');
    }
    const updated = await this.repository.replace(id, normalized, actor);
    if (!updated) throw this.notFound(id);
    this.logger.log(`Candidate updated: id=${updated.id} updateCount=${updated.updateCount}`);
    return updated;
  }

  private normalize(request: ICreateCandidateRequest): ICreateCandidateRequest {
    return { ...request, email: request.email.trim().toLowerCase() };
  }

  private notFound(id: string): NotFoundException {
    this.logger.warn(`Candidate not found: id=${id}`);
    return new NotFoundException('Candidate not found');
  }

  private duplicate(existing: ICandidate): BadRequestException {
    this.logger.warn(`Duplicate candidate email: existingId=${existing.id}`);
    return new BadRequestException({ statusCode: 400, message: 'A candidate with this email already exists', error: 'Bad Request', existing });
  }
}
