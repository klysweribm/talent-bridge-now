import { BadRequestException, ForbiddenException, Inject, Injectable, Logger, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import type { ICandidateActor, IProcessDetail, IUpdateProcessRequest } from '@ibm-talent-bridge/shared-types';
import { UserDirectoryService } from '../../../auth/application/services/user-directory.service';
import { CANDIDATE_DIRECTORY_PORT, PROCESS_ERROR_CODES, PROCESS_REPOSITORY_PORT } from '../../domain/constants/process.constants';
import type { IProcessChanges, TProcessRecord } from '../../domain/interfaces/process-record.interface';
import type { ICandidateDirectoryPort } from '../ports/candidate-directory.port';
import type { IProcessRepositoryPort } from '../ports/process-repository.port';
import { terminalStateError } from './candidate-association.helpers';
import { isOwnerPm, loadManageableProcess } from './process-access.helpers';
import { ProcessDetailService } from './process-detail.service';

/** `PATCH /processes/:id`: edición, cambio de reclutador y de estado. Todas las reglas viven aquí. */
@Injectable()
export class ProcessUpdateService {
  private readonly logger = new Logger(ProcessUpdateService.name);

  constructor(
    @Inject(PROCESS_REPOSITORY_PORT) private readonly repository: IProcessRepositoryPort,
    @Inject(CANDIDATE_DIRECTORY_PORT) private readonly directory: ICandidateDirectoryPort,
    private readonly users: UserDirectoryService,
    private readonly details: ProcessDetailService,
  ) {}

  async update(id: string, request: IUpdateProcessRequest, actor: ICandidateActor): Promise<IProcessDetail> {
    const record = await loadManageableProcess(this.repository, this.logger, id, actor);
    if (request.recruiterId !== undefined) await this.assertCanSetRecruiter(record, request.recruiterId, actor);
    const cancelling = request.status === 'cancelled';
    if (cancelling) await this.releaseAll(record);
    const changes: IProcessChanges = { ...request, ...(cancelling ? { candidateIds: [] } : {}) };
    const updated = await this.repository.update(id, changes);
    if (!updated) throw await this.updateMissError(id);
    this.logger.log(`Process updated: id=${id} fields=${Object.keys(request).join(',')}`);
    return this.details.build(updated);
  }

  /** El update condicional no coincidió: otro request lo borró (404) o lo dejó terminal mientras tanto (400). */
  private async updateMissError(id: string): Promise<Error> {
    const current = await this.repository.findById(id);
    if (!current) return new NotFoundException(`Process ${id} not found`);
    return terminalStateError(current.status);
  }

  private async assertCanSetRecruiter(record: TProcessRecord, recruiterId: string, actor: ICandidateActor): Promise<void> {
    if (!isOwnerPm(record, actor)) throw new ForbiddenException('Only the owner PM can change the recruiter');
    if ((await this.users.findRole(recruiterId)) !== 'recruiter') throw new BadRequestException('recruiterId must be an existing user with role recruiter');
  }

  /** Libera (idempotente) a los candidatos antes de cancelar; si falla, el proceso queda como estaba y se puede reintentar. */
  private async releaseAll(record: TProcessRecord): Promise<void> {
    try {
      for (const candidateId of record.candidateIds) await this.directory.release(candidateId, record.id);
    } catch (error) {
      this.logger.error(`Cancelling failed while releasing candidates: process=${record.id}`, error);
      throw new ServiceUnavailableException({
        statusCode: 503, code: PROCESS_ERROR_CODES.releaseFailed, message: 'Could not release the candidates; the process was not cancelled',
      });
    }
  }
}
