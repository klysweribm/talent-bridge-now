import { BadRequestException, ConflictException, Inject, Injectable, Logger, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { CANDIDATE_DIRECTORY_PORT, PROCESSES_CONFIG, PROCESS_REPOSITORY_PORT } from '../../domain/constants/process.constants';
import type { IProcessesConfig } from '../../domain/interfaces/process-config.interface';
import type { ICandidateDirectoryPort } from '../ports/candidate-directory.port';
import type { IProcessRepositoryPort } from '../ports/process-repository.port';
import { assertWithinLimit, releaseQuietly, unavailableCandidate } from './candidate-association.helpers';

/** Candidatos que nacen con el proceso (`POST /processes`): validar antes de crear, marcar después, revertir si falla. */
@Injectable()
export class ProcessCandidateClaimService {
  private readonly logger = new Logger(ProcessCandidateClaimService.name);

  constructor(
    @Inject(PROCESS_REPOSITORY_PORT) private readonly repository: IProcessRepositoryPort,
    @Inject(CANDIDATE_DIRECTORY_PORT) private readonly directory: ICandidateDirectoryPort,
    @Inject(PROCESSES_CONFIG) private readonly config: IProcessesConfig,
  ) {}

  /** Duplicados, límite, existencia y disponibilidad: todo antes de crear nada. */
  async validate(ids: readonly string[]): Promise<void> {
    if (ids.length === 0) return;
    if (new Set(ids).size !== ids.length) throw new BadRequestException('candidateIds contains duplicated ids');
    assertWithinLimit(ids.length, this.config.maxCandidatesPerProcess);
    const found = await this.directory.findByIds(ids);
    if (found.length !== ids.length) throw new NotFoundException('One or more candidates were not found');
    if (found.some((entry) => entry.processId !== undefined)) throw new ConflictException('One or more candidates already belong to a process');
  }

  /** Marca los candidatos del proceso recién creado; si falla algo revierte lo marcado y borra el proceso. */
  async claim(processId: string, ids: readonly string[]): Promise<void> {
    const claimed: string[] = [];
    try {
      for (const id of ids) {
        const outcome = await this.directory.assign(id, processId);
        if (outcome !== 'assigned') throw unavailableCandidate(outcome);
        claimed.push(id);
      }
    } catch (error) {
      await Promise.all(claimed.map((id) => releaseQuietly(this.directory, this.logger, id, processId)));
      await this.repository.delete(processId).catch((cause: unknown) => this.logger.error(`Rollback failed: could not delete process ${processId}`, cause));
      if (error instanceof ConflictException || error instanceof NotFoundException) throw error;
      this.logger.error(`Creating process ${processId} with candidates failed after rollback`, error);
      throw new ServiceUnavailableException('Could not associate the candidates; the process was not created');
    }
  }
}
