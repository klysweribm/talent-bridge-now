import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IBenchQuery, IBenchResource, PaginatedResponse } from '@ibm-talent-bridge/shared-types';
import { DEFAULT_LIMIT, DEFAULT_PAGE, DEFAULT_STATUSES } from '../../domain/constants/bench.constants';
import type { IBenchFilters } from '../../domain/interfaces/bench-filters.interface';
import { BENCH_REPOSITORY_PORT, type IBenchRepositoryPort } from '../ports/bench-repository.port';

@Injectable()
export class BenchService {
  constructor(@Inject(BENCH_REPOSITORY_PORT) private readonly repository: IBenchRepositoryPort) {}

  async list(query: IBenchQuery): Promise<PaginatedResponse<IBenchResource>> {
    const page = query.page ?? DEFAULT_PAGE;
    const limit = query.limit ?? DEFAULT_LIMIT;
    const filters = this.toFilters(query);

    const [data, total] = await Promise.all([
      this.repository.findPaginated(filters, page, limit),
      this.repository.count(filters),
    ]);

    return { data: [...data], total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getByCode(benchCode: string): Promise<IBenchResource> {
    const resource = await this.repository.findByCode(benchCode);
    if (!resource) {
      throw new NotFoundException(`Bench resource ${benchCode} not found`);
    }
    return resource;
  }

  async listSkills(): Promise<readonly string[]> {
    const names = await this.repository.listSkillNames(DEFAULT_STATUSES);
    return [...new Set(names)].sort((a, b) => a.localeCompare(b));
  }

  private toFilters(query: IBenchQuery): IBenchFilters {
    const availableBy = query.availableBy ? new Date(query.availableBy) : undefined;
    if (availableBy && Number.isNaN(availableBy.getTime())) {
      throw new BadRequestException('availableBy must be a valid date');
    }
    return {
      skills: query.skills ?? [],
      seniority: query.seniority ?? [],
      statuses: query.status?.length ? query.status : DEFAULT_STATUSES,
      country: query.country,
      availableBy,
    };
  }
}
