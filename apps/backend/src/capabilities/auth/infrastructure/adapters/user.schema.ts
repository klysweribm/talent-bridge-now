import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import type { TUserStatus, UserRole } from '@ibm-talent-bridge/shared-types';

import { DEFAULT_USER_STATUS, USER_BAND_MAX, USER_BAND_MIN, USER_DESCRIPTION_MAX, USER_STATUSES } from '../../domain/constants/user-directory.constants';

export type UserDocument = HydratedDocument<UserModel>;

const USER_ROLES: readonly UserRole[] = ['recruiter', 'technical_ref', 'pm'];

@Schema({ timestamps: true, collection: 'users' })
export class UserModel {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true, trim: true })
  fullName!: string;

  @Prop({ type: String, required: true, enum: USER_ROLES })
  role!: UserRole;

  @Prop({ required: true })
  timezone!: string;

  @Prop()
  avatarUrl?: string;

  @Prop({ type: [String] })
  specialty?: string[];

  // Sin `required`: los usuarios anteriores a PROC-1c no los tienen y se leen como band null / description '' / status active.
  @Prop({ type: Number, min: USER_BAND_MIN, max: USER_BAND_MAX })
  band?: number;

  @Prop({ type: String, trim: true, maxlength: USER_DESCRIPTION_MAX })
  description?: string;

  @Prop({ type: String, enum: USER_STATUSES, default: DEFAULT_USER_STATUS })
  status?: TUserStatus;

  createdAt?: Date;
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(UserModel);
