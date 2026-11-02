import { Inject, Injectable, Logger } from '@nestjs/common';
import type { IProcessDetail } from '@ibm-talent-bridge/shared-types';
import { CANDIDATE_DIRECTORY_PORT, PROCESSES_CONFIG } from '../../domain/constants/process.constants';
import type { IProcessesConfig } from '../../domain/interfaces/process-config.interface';
import type { TProcessRecord } from '../../domain/interfaces/process-record.interface';
import type { ICandidateDirectoryPort } from '../ports/candidate-directory.port';

@Injectable()
export class ProcessDetailService {
  private readonly logger = new Logger(ProcessDetailService.name);

  constructor(
    @Inject(CANDIDATE_DIRECTORY_PORT) private readonly directory: ICandidateDirectoryPort,
    @Inject(PROCESSES_CONFIG) private readonly config: IProcessesConfig,
  ) {}

  /** Resuelve los resúmenes de candidatos; un id huérfano (candidato borrado) se omite y se registra. */
  async build(record: TProcessRecord): Promise<IProcessDetail> {
    const found = await this.directory.findByIds(record.candidateIds);
    const known = new Set(found.map((entry) => entry.id));
    const orphans = record.candidateIds.filter((id) => !known.has(id));
    if (orphans.length > 0) this.logger.warn(`Process ${record.id} references missing candidates: ids=${orphans.join(',')}`);
    const candidates = found.map(({ id, fullName, primaryRole }) => ({ id, fullName, ...(primaryRole ? { primaryRole } : {}) }));
    return { ...record, maxCandidates: this.config.maxCandidatesPerProcess, candidates };
  }
}
