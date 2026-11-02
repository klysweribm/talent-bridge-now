import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, type Model } from 'mongoose';
import type { ICandidate, ICandidateActor, ICreateCandidateRequest, TCandidateAssignment, TCandidateStatus } from '@ibm-talent-bridge/shared-types';
import type { ICandidateRepositoryPort, ICandidateSimilarQuery } from '../../application/ports/candidate-repository.port';
import { CANDIDATE_SIMILAR_LIMIT } from '../../domain/constants/candidate.constants';
import { DuplicateCandidateEmailError } from '../../domain/errors/duplicate-candidate-email.error';
import { isDuplicateKey, PROFILE_FIELDS, searchKeys } from './candidate-adapter.helpers';
import { CandidateModel, type CandidateDocument } from './candidate.schema';

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

  async findByIds(ids: readonly string[]): Promise<readonly ICandidate[]> {
    const valid = ids.filter((id) => isValidObjectId(id));
    if (valid.length === 0) return [];
    const documents = await this.model.find({ _id: { $in: valid } }).exec();
    const byId = new Map(documents.map((document) => [String(document._id), document]));
    return valid.flatMap((id) => (byId.has(id) ? [this.toDomain(byId.get(id) as CandidateDocument)] : []));
  }

  async claimProcess(id: string, processId: string): Promise<boolean> {
    if (!isValidObjectId(id)) return false;
    const result = await this.model.updateOne({ _id: id, processId: { $exists: false } }, { $set: { processId } }).exec();
    return result.modifiedCount === 1;
  }

  async releaseProcess(id: string, processId: string): Promise<boolean> {
    if (!isValidObjectId(id)) return false;
    const result = await this.model.updateOne({ _id: id, processId }, { $unset: { processId: 1 } }).exec();
    return result.modifiedCount === 1;
  }

  async findPage(page: number, limit: number, assignment?: TCandidateAssignment): Promise<{ readonly items: readonly ICandidate[]; readonly total: number }> {
    const filter = assignment ? { processId: { $exists: assignment === 'assigned' } } : {};
    const [documents, total] = await Promise.all([
      this.model.find(filter).sort({ createdAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit).exec(),
      this.model.countDocuments(filter).exec(),
    ]);
    return { items: documents.map((document) => this.toDomain(document)), total };
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
