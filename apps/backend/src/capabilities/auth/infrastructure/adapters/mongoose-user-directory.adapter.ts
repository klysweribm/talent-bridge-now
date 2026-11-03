import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, type FilterQuery, type Model } from 'mongoose';
import type { IUserOption, IUserProfile, UserRole } from '@ibm-talent-bridge/shared-types';
import type { IUserDirectoryPort } from '../../application/ports/user-directory.port';
import { DEFAULT_USER_STATUS } from '../../domain/constants/user-directory.constants';
import { UserModel, type UserDocument } from './user.schema';

/** `$ne: 'inactive'` y no `= 'active'`: los usuarios anteriores a PROC-1c no tienen `status` y cuentan como activos. */
const filterOf = (role: UserRole, onlyActive: boolean): FilterQuery<UserDocument> => (onlyActive ? { role, status: { $ne: 'inactive' } } : { role });

@Injectable()
export class MongooseUserDirectoryAdapter implements IUserDirectoryPort {
  constructor(@InjectModel(UserModel.name) private readonly userModel: Model<UserDocument>) {}

  async findOptionsByRole(role: UserRole, page: number, limit: number, onlyActive = false): Promise<readonly IUserOption[]> {
    const documents = await this.userModel
      .find(filterOf(role, onlyActive), { fullName: 1, band: 1 })
      .sort({ fullName: 1, _id: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
    return documents.map((document) => ({
      id: document._id.toString(),
      fullName: document.fullName,
      ...(role === 'technical_ref' && typeof document.band === 'number' ? { band: document.band } : {}),
    }));
  }

  countByRole(role: UserRole, onlyActive = false): Promise<number> {
    return this.userModel.countDocuments(filterOf(role, onlyActive)).exec();
  }

  async findRoleById(id: string): Promise<UserRole | null> {
    if (!isValidObjectId(id)) return null;
    const document = await this.userModel.findById(id, { role: 1 }).exec();
    return document ? document.role : null;
  }

  async findProfilesByIds(ids: readonly string[]): Promise<readonly IUserProfile[]> {
    const valid = ids.filter((id) => isValidObjectId(id));
    if (valid.length === 0) return [];
    const documents = await this.userModel.find({ _id: { $in: valid } }, { email: 1, fullName: 1, role: 1, band: 1, description: 1, status: 1, avatarUrl: 1 }).exec();
    return documents.map((document) => ({
      id: document._id.toString(),
      fullName: document.fullName,
      email: document.email,
      role: document.role,
      band: document.band ?? null,
      description: document.description ?? '',
      status: document.status ?? DEFAULT_USER_STATUS,
      ...(document.avatarUrl ? { avatarUrl: document.avatarUrl } : {}),
    }));
  }
}
