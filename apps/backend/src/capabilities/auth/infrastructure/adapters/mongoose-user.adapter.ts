import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import type { User } from '@ibm-talent-bridge/shared-types';
import type { IUserRepositoryPort } from '../../application/ports/user-repository.port';
import { DEFAULT_USER_STATUS } from '../../domain/constants/user-directory.constants';
import { TraceFlow } from '../../../../shared/observability/trace-flow.decorator';
import { UserModel, type UserDocument } from './user.schema';

@Injectable()
export class MongooseUserAdapter implements IUserRepositoryPort {
  constructor(@InjectModel(UserModel.name) private readonly userModel: Model<UserDocument>) {}

  @TraceFlow()
  async findByEmail(email: string): Promise<User | null> {
    const document = await this.userModel.findOne({ email: email.toLowerCase() }).exec();
    return document ? this.toDomain(document) : null;
  }

  private toDomain(document: UserDocument): User {
    return {
      id: document._id.toString(),
      email: document.email,
      fullName: document.fullName,
      role: document.role,
      timezone: document.timezone,
      avatarUrl: document.avatarUrl,
      specialty: document.specialty,
      band: document.band ?? null,
      description: document.description ?? '',
      status: document.status ?? DEFAULT_USER_STATUS,
      createdAt: document.createdAt?.toISOString() ?? new Date().toISOString(),
      updatedAt: document.updatedAt?.toISOString() ?? new Date().toISOString(),
    };
  }
}
