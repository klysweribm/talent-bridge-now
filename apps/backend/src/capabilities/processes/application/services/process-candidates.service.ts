import {
  Inject, Injectable, Logger, NotFoundException, ServiceUnavailableException,
} from '@nestjs/common';
import type { ICandidateActor, IProcessDetail } from '@ibm-talent-bridge/shared-types';
import { CANDIDATE_DIRECTORY_PORT, PROCESSES_CONFIG, PROCESS_REPOSITORY_PORT } from '../../domain/constants/process.constants';
import type { IProcessesConfig } from '../../domain/interfaces/process-config.interface';
import type { TProcessRecord } from '../../domain/interfaces/process-record.interface';
import type { ICandidateDirectoryPort } from '../ports/candidate-directory.port';
import type { IProcessRepositoryPort } from '../ports/process-repository.port';
import { alreadyAssignedError, assertWithinLimit, releaseQuietly, unavailableCandidate } from './candidate-association.helpers';
import { loadManageableProcess } from './process-access.helpers';
import { ProcessDetailService } from './process-detail.service';

/** Asociación proceso <-> candidato con consistencia por llamada en memoria, sin transacciones (ADR-013). */
@Injectable()
export class ProcessCandidatesService {
  private readonly logger = new Logger(ProcessCandidatesService.name);

  constructor(
    @Inject(PROCESS_REPOSITORY_PORT) private readonly repository: IProcessRepositoryPort,
    @Inject(CANDIDATE_DIRECTORY_PORT) private readonly directory: ICandidateDirectoryPort,
    @Inject(PROCESSES_CONFIG) private readonly config: IProcessesConfig,
    private readonly details: ProcessDetailService,
  ) {}

  async associate(processId: string, candidateId: string, actor: ICandidateActor): Promise<IProcessDetail> {
    const record = await loadManageableProcess(this.repository, this.logger, processId, actor);
    const [entry] = await this.directory.findByIds([candidateId]);
    if (!entry) throw new NotFoundException('Candidate not found');
    if (record.candidateIds.length >= this.config.maxCandidatesPerProcess) assertWithinLimit(record.candidateIds.length + 1, this.config.maxCandidatesPerProcess);
    if (entry.processId !== undefined) throw alreadyAssignedError();
    const outcome = await this.directory.assign(candidateId, processId);
    if (outcome !== 'assigned') throw unavailableCandidate(outcome);
    let added: boolean;
    try {
      added = await this.repository.addCandidate(processId, candidateId, this.config.maxCandidatesPerProcess);
    } catch (error) {
      await releaseQuietly(this.directory, this.logger, candidateId, processId);
      this.logger.error(`Associating failed after releasing: process=${processId} candidate=${candidateId}`, error);
      throw new ServiceUnavailableException('Could not associate the candidate; no changes were kept');
    }
    if (!added) {
      await releaseQuietly(this.directory, this.logger, candidateId, processId);
      assertWithinLimit(this.config.maxCandidatesPerProcess + 1, this.config.maxCandidatesPerProcess);
    }
    this.logger.log(`Candidate associated: process=${processId} candidate=${candidateId}`);
    return this.details.build((await this.repository.findById(processId)) as TProcessRecord);
  }

  async dissociate(processId: string, candidateId: string, actor: ICandidateActor): Promise<IProcessDetail> {
    const record = await loadManageableProcess(this.repository, this.logger, processId, actor);
    if (!record.candidateIds.includes(candidateId)) throw new NotFoundException('The candidate is not in this process');
    if (!(await this.repository.removeCandidate(processId, candidateId))) throw new NotFoundException('The candidate is not in this process');
    try {
      await this.directory.release(candidateId, processId);
    } catch (error) {
      await this.repository.addCandidate(processId, candidateId, this.config.maxCandidatesPerProcess)
        .catch((cause: unknown) => this.logger.error(`Rollback failed: process=${processId} candidate=${candidateId}`, cause));
      this.logger.error(`Removing failed after restoring: process=${processId} candidate=${candidateId}`, error);
      throw new ServiceUnavailableException('Could not remove the candidate; no changes were kept');
    }
    this.logger.log(`Candidate removed: process=${processId} candidate=${candidateId}`);
    return this.details.build((await this.repository.findById(processId)) as TProcessRecord);
  }
}
