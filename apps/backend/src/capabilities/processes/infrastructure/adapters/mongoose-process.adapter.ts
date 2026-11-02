import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, type Model } from 'mongoose';
import type { IProcessRepositoryPort } from '../../application/ports/process-repository.port';
import { DEFAULT_PROCESS_STATUS, TERMINAL_PROCESS_STATUSES } from '../../domain/constants/process.constants';
import type { INewProcess, IProcessChanges, TProcessRecord } from '../../domain/interfaces/process-record.interface';
import { ProcessModel, type ProcessDocument } from './process.schema';

@Injectable()
export class MongooseProcessAdapter implements IProcessRepositoryPort {
  constructor(@InjectModel(ProcessModel.name) private readonly model: Model<ProcessDocument>) {}

  async create(process: INewProcess): Promise<TProcessRecord> {
    const document = await this.model.create({ ...process, candidateIds: [...(process.candidateIds ?? [])] });
    return this.toDomain(document);
  }

  async findById(id: string): Promise<TProcessRecord | null> {
    if (!isValidObjectId(id)) return null;
    const document = await this.model.findById(id).exec();
    return document ? this.toDomain(document) : null;
  }

  async findPaginated(page: number, limit: number): Promise<readonly TProcessRecord[]> {
    const documents = await this.model.find().sort({ createdAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit).exec();
    return documents.map((document) => this.toDomain(document));
  }

  count(): Promise<number> {
    return this.model.countDocuments().exec();
  }

  async addCandidate(id: string, candidateId: string, max: number): Promise<boolean> {
    if (!isValidObjectId(id)) return false;
    // `candidateIds.<max-1>` inexistente = hay menos de `max` elementos; con el $ne evita duplicar.
    const filter = { _id: id, candidateIds: { $ne: candidateId }, [`candidateIds.${max - 1}`]: { $exists: false } };
    const updated = await this.model.findOneAndUpdate(filter, { $addToSet: { candidateIds: candidateId } }).exec();
    return updated !== null;
  }

  async removeCandidate(id: string, candidateId: string): Promise<boolean> {
    if (!isValidObjectId(id)) return false;
    const updated = await this.model.findOneAndUpdate({ _id: id, candidateIds: candidateId }, { $pull: { candidateIds: candidateId } }).exec();
    return updated !== null;
  }

  async update(id: string, changes: IProcessChanges): Promise<TProcessRecord | null> {
    if (!isValidObjectId(id)) return null;
    const set = {
      ...changes,
      ...(changes.candidateIds ? { candidateIds: [...changes.candidateIds] } : {}),
      ...(changes.technicalRefIds ? { technicalRefIds: [...changes.technicalRefIds] } : {}),
    };
    // Condicional: un cierre/cancelación concurrente no se pisa. `$nin` incluye documentos sin `status` (legacy = abierto).
    const filter = { _id: id, status: { $nin: TERMINAL_PROCESS_STATUSES } };
    const document = await this.model.findOneAndUpdate(filter, { $set: set }, { new: true }).exec();
    return document ? this.toDomain(document) : null;
  }

  async delete(id: string): Promise<void> {
    if (isValidObjectId(id)) await this.model.deleteOne({ _id: id }).exec();
  }

  private toDomain(document: ProcessDocument): TProcessRecord {
    return {
      id: document._id.toString(),
      title: document.title,
      clientName: document.clientName,
      opportunityRole: document.opportunityRole ?? '',
      skills: [...(document.skills ?? [])],
      roleDescription: document.roleDescription ?? '',
      band: document.band ?? null,
      ownerPmId: document.ownerPmId,
      recruiterId: document.recruiterId ?? null,
      status: document.status ?? DEFAULT_PROCESS_STATUS,
      candidateIds: [...document.candidateIds],
      technicalRefIds: [...(document.technicalRefIds ?? [])],
      createdBy: { id: document.createdBy.id, email: document.createdBy.email, role: document.createdBy.role },
      createdAt: document.createdAt.toISOString(),
      updatedAt: document.updatedAt.toISOString(),
    };
  }
}
