import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import type { UserRole } from '@ibm-talent-bridge/shared-types';

export type ProcessDocument = HydratedDocument<ProcessModel>;
const ACTOR_ROLES: readonly UserRole[] = ['recruiter', 'pm', 'technical_ref'];

@Schema({ _id: false })
export class ProcessActorModel {
  @Prop({ type: String, required: true }) id!: string;
  @Prop({ type: String, required: true }) email!: string;
  @Prop({ type: String, required: true, enum: ACTOR_ROLES }) role!: UserRole;
}

@Schema({ timestamps: true, collection: 'processes' })
export class ProcessModel {
  @Prop({ type: String, required: true, trim: true }) title!: string;
  @Prop({ type: String, required: true, trim: true }) clientName!: string;
  @Prop({ type: String, required: true, index: true }) ownerPmId!: string;
  @Prop({ type: String, default: null, index: true }) recruiterId!: string | null;
  @Prop({ type: [String], default: [] }) candidateIds!: string[];
  @Prop({ type: SchemaFactory.createForClass(ProcessActorModel), required: true }) createdBy!: ProcessActorModel;

  createdAt!: Date;
  updatedAt!: Date;
}

export const ProcessSchema = SchemaFactory.createForClass(ProcessModel);
