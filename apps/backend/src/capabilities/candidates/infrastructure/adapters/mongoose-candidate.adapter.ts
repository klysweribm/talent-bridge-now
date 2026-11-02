import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, type Model } from 'mongoose';
import type { ICandidate, ICandidateActor, ICreateCandidateRequest, TCandidateStatus } from '@ibm-talent-bridge/shared-types';
import type { ICandidateRepositoryPort, ICandidateSimilarQuery } from '../../application/ports/candidate-repository.port';
import { normalizeName, phoneKey } from '../../domain/candidate-similarity';
import { CANDIDATE_SIMILAR_LIMIT } from '../../domain/constants/candidate.constants';
import { DuplicateCandidateEmailError } from '../../domain/errors/duplicate-candidate-email.error';
import { CandidateModel, type CandidateDocument } from './candidate.schema';

const MONGO_DUPLICATE_KEY = 11000;

const isDuplicateKey = (error: unknown): boolean =>
  typeof error === 'object' && error !== null && (error as { code?: unknown }).code === MONGO_DUPLICATE_KEY;

/** Campos de perfil que un reemplazo sustituye por completo (los ausentes se eliminan). Email y status no están. */
const PROFILE_FIELDS = [
  'fullName', 'phone', 'linkedIn', 'location', 'primaryRole', 'seniority', 'yearsExperience',
  'skills', 'languages', 'education', 'experience', 'summary',
] as const;

const searchKeys = (request: ICreateCandidateRequest): { nameKey?: string; phoneKey?: string } => ({
  nameKey: normalizeName(request.fullName) || undefined,
  phoneKey: phoneKey(request.phone),
});

/** Sin `@TraceFlow()`: los argumentos y resultados son datos personales del candidato. */
@Injectable()
export class MongooseCandidateAdapter implements ICandidateRepositoryPort {
  constructor(@InjectModel(CandidateModel.name) private readonly model: Model<CandidateDocument>) {}

  async findByEmail(email: string): Promise<ICandidate | null> {
    const document = await this.model.findOne({ email }).exec();
    return document ? this.toDomain(document) : null;
  }

  async findById(id: string): Promise<ICandidate | null> {
    if (!isValidObjectId(id)) return null;
    const document = await this.model.findById(id).exec();
    return document ? this.toDomain(document) : null;
  }

  async findSimilar(query: ICandidateSimilarQuery): Promise<readonly ICandidate[]> {
    const keys = [
      ...(query.nameKey ? [{ nameKey: query.nameKey }] : []),
      ...(query.phoneKey ? [{ phoneKey: query.phoneKey }] : []),
    ];
    if (keys.length === 0) return [];
    const documents = await this.model
      .find({ $or: keys, email: { $ne: query.excludeEmail } })
      .sort({ updatedAt: -1, _id: 1 })
      .limit(CANDIDATE_SIMILAR_LIMIT)
      .exec();
    return documents.map((document) => this.toDomain(document));
  }

  async replace(id: string, request: ICreateCandidateRequest, actor: ICandidateActor): Promise<ICandidate | null> {
    if (!isValidObjectId(id)) return null;
    const values = { ...searchKeys(request), ...request } as Record<string, unknown>;
    const unsettable = [...PROFILE_FIELDS, 'nameKey', 'phoneKey'];
    const $set: Record<string, unknown> = { updatedBy: actor };
    const $unset: Record<string, 1> = {};
    for (const field of unsettable) {
      if (values[field] === undefined) $unset[field] = 1;
      else $set[field] = values[field];
    }
    const document = await this.model
      .findByIdAndUpdate(id, { $set, $unset, $inc: { updateCount: 1 } }, { new: true })
      .exec();
    return document ? this.toDomain(document) : null;
  }

  async create(request: ICreateCandidateRequest, status: TCandidateStatus, actor: ICandidateActor): Promise<ICandidate> {
    try {
      const document = await this.model.create({ ...request, ...searchKeys(request), status, createdBy: actor, updateCount: 0 });
      return this.toDomain(document);
    } catch (error) {
      if (isDuplicateKey(error)) throw new DuplicateCandidateEmailError({ cause: error });
      throw error;
    }
  }

  private toDomain(document: CandidateDocument): ICandidate {
    const plain = document.toObject({ versionKey: false });
    const { _id, createdAt, updatedAt, updateCount, ...rest } = plain;
    const fields: Record<string, unknown> = { ...rest };
    // Claves de búsqueda internas: no salen del adaptador.
    delete fields.nameKey;
    delete fields.phoneKey;
    return {
      ...(JSON.parse(JSON.stringify(fields)) as Omit<ICandidate, 'id' | 'createdAt' | 'updatedAt' | 'updateCount'>),
      updateCount: updateCount ?? 0,
      id: String(_id),
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    };
  }
}
