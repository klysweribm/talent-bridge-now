import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import type { UserRole } from '@ibm-talent-bridge/shared-types';

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

  createdAt?: Date;
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(UserModel);
