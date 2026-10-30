import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import type { IBenchResource, TBenchStatus } from '@ibm-talent-bridge/shared-types';
import { TraceFlow } from '../../../../shared/observability/trace-flow.decorator';
import type { IBenchRepositoryPort } from '../../application/ports/bench-repository.port';
import type { IBenchFilters } from '../../domain/interfaces/bench-filters.interface';
import { buildBenchQuery } from './bench-filter.query';
import { BenchResourceModel, type BenchResourceDocument } from './bench-resource.schema';

const SORT = { availableFrom: 1, benchCode: 1 } as const;
const toIsoDate = (date: Date): string => date.toISOString().slice(0, 10);

@Injectable()
export class MongooseBenchAdapter implements IBenchRepositoryPort {
  constructor(
    @InjectModel(BenchResourceModel.name) private readonly model: Model<BenchResourceDocument>,
  ) {}

  @TraceFlow()
  async findPaginated(filters: IBenchFilters, page: number, limit: number): Promise<readonly IBenchResource[]> {
    const documents = await this.model
      .find(buildBenchQuery(filters))
      .sort(SORT)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
    return documents.map((document) => this.toDomain(document));
  }

  @TraceFlow()
  count(filters: IBenchFilters): Promise<number> {
    return this.model.countDocuments(buildBenchQuery(filters)).exec();
  }

  @TraceFlow()
  async findByCode(benchCode: string): Promise<IBenchResource | null> {
    const document = await this.model.findOne({ benchCode }).exec();
    return document ? this.toDomain(document) : null;
  }

  @TraceFlow()
  async listSkillNames(statuses: readonly TBenchStatus[]): Promise<readonly string[]> {
    const names = await this.model.distinct('skills.name', { status: { $in: statuses } }).exec();
    return names.sort((a, b) => a.localeCompare(b));
  }

  @TraceFlow()
  async upsertMany(resources: readonly Omit<IBenchResource, 'id'>[]): Promise<number> {
    if (resources.length === 0) return 0;
    await this.model.bulkWrite(
      resources.map((resource) => ({
        updateOne: {
          filter: { benchCode: resource.benchCode },
          update: {
            $set: {
              ...resource,
              skills: [...resource.skills],
              languages: [...resource.languages],
              benchSince: new Date(resource.benchSince),
              availableFrom: new Date(resource.availableFrom),
            },
          },
          upsert: true,
        },
      })),
    );
    return resources.length;
  }

  private toDomain(document: BenchResourceDocument): IBenchResource {
    return {
      id: document._id.toString(),
      benchCode: document.benchCode,
      displayName: document.displayName,
      primaryRole: document.primaryRole,
      practice: document.practice,
      seniority: document.seniority,
      skills: document.skills.map(({ name, level, years }) => ({ name, level, years })),
      languages: document.languages.map(({ code, level }) => ({ code, level })),
      location: { country: document.location.country, city: document.location.city },
      benchSince: toIsoDate(document.benchSince),
      availableFrom: toIsoDate(document.availableFrom),
      status: document.status,
    };
  }
}
