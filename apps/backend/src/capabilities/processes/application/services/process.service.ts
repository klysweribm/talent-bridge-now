import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import type {
  ICandidateActor, ICreateProcessRequest, IProcess, IProcessDetail, IProcessLimits, IProcessListItem, PaginatedResponse, UserRole,
} from '@ibm-talent-bridge/shared-types';
import { UserDirectoryService } from '../../../auth/application/services/user-directory.service';
import { PROCESSES_CONFIG, PROCESS_REPOSITORY_PORT } from '../../domain/constants/process.constants';
import type { IProcessesConfig } from '../../domain/interfaces/process-config.interface';
import type { TProcessRecord } from '../../domain/interfaces/process-record.interface';
import type { IProcessRepositoryPort } from '../ports/process-repository.port';
import { ProcessCandidateClaimService } from './process-candidate-claim.service';
import { ProcessDetailService } from './process-detail.service';

@Injectable()
export class ProcessService {
  private readonly logger = new Logger(ProcessService.name);

  constructor(
    @Inject(PROCESS_REPOSITORY_PORT) private readonly repository: IProcessRepositoryPort,
    private readonly users: UserDirectoryService,
    @Inject(PROCESSES_CONFIG) private readonly config: IProcessesConfig,
    private readonly claims: ProcessCandidateClaimService,
    private readonly details: ProcessDetailService,
  ) {}

  /** PM crea: es el dueño y puede elegir reclutador. Reclutador crea: elige PM y se asigna a sí mismo. */
  async create(request: ICreateProcessRequest, actor: ICandidateActor): Promise<IProcess> {
    const candidateIds = request.candidateIds ?? [];
    await this.claims.validate(candidateIds);
    const ownerPmId = actor.role === 'pm' ? actor.id : this.requireOwnerPm(request);
    const recruiterId = actor.role === 'pm' ? (request.recruiterId ?? null) : actor.id;
    if (actor.role === 'pm') await this.assertRole(recruiterId, 'recruiter', 'recruiterId');
    else await this.assertRole(ownerPmId, 'pm', 'ownerPmId');

    const created = await this.repository.create({
      title: request.title, clientName: request.clientName, ownerPmId, recruiterId, createdBy: actor, candidateIds,
    });
    await this.claims.claim(created.id, candidateIds);
    this.logger.log(`Process created: id=${created.id}`);
    return this.withMax(created);
  }

  async list(page: number, limit: number): Promise<PaginatedResponse<IProcessListItem>> {
    const [records, total] = await Promise.all([this.repository.findPaginated(page, limit), this.repository.count()]);
    const data = records.map(({ candidateIds, ...rest }) => ({
      ...rest, maxCandidates: this.config.maxCandidatesPerProcess, candidateCount: candidateIds.length,
    }));
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getById(id: string): Promise<IProcessDetail> {
    const record = await this.repository.findById(id);
    if (!record) throw new NotFoundException(`Process ${id} not found`);
    return this.details.build(record);
  }

  private requireOwnerPm(request: ICreateProcessRequest): string {
    if (!request.ownerPmId) throw new BadRequestException('ownerPmId is required when a recruiter creates a process');
    return request.ownerPmId;
  }

  private async assertRole(id: string | null, expected: UserRole, field: string): Promise<void> {
    if (id === null) return;
    const role = await this.users.findRole(id);
    if (role !== expected) throw new BadRequestException(`${field} must be an existing user with role ${expected}`);
  }

  /** Tope de candidatos por proceso, disponible antes de crear uno. */
  getLimits(): IProcessLimits {
    return { maxCandidates: this.config.maxCandidatesPerProcess };
  }

  private withMax(record: TProcessRecord): IProcess {
    return { ...record, maxCandidates: this.config.maxCandidatesPerProcess };
  }
}
