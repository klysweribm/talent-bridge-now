import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, type Model } from 'mongoose';
import type { IUserOption, UserRole } from '@ibm-talent-bridge/shared-types';
import type { IUserDirectoryPort } from '../../application/ports/user-directory.port';
import { UserModel, type UserDocument } from './user.schema';

@Injectable()
export class MongooseUserDirectoryAdapter implements IUserDirectoryPort {
  constructor(@InjectModel(UserModel.name) private readonly userModel: Model<UserDocument>) {}

  async findOptionsByRole(role: UserRole, page: number, limit: number): Promise<readonly IUserOption[]> {
    const documents = await this.userModel
      .find({ role }, { fullName: 1 })
      .sort({ fullName: 1, _id: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
    return documents.map((document) => ({ id: document._id.toString(), fullName: document.fullName }));
  }

  countByRole(role: UserRole): Promise<number> {
    return this.userModel.countDocuments({ role }).exec();
  }

  async findRoleById(id: string): Promise<UserRole | null> {
    if (!isValidObjectId(id)) return null;
    const document = await this.userModel.findById(id, { role: 1 }).exec();
    return document ? document.role : null;
  }
}
