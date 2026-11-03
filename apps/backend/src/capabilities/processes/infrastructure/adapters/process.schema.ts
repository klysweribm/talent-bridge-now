import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import type { TProcessStatus, UserRole } from '@ibm-talent-bridge/shared-types';

import { DEFAULT_PROCESS_STATUS, PROCESS_BAND_MAX, PROCESS_BAND_MIN, PROCESS_STATUSES } from '../../domain/constants/process.constants';

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
  // Sin `required`: los procesos anteriores a PROC-1c no tienen estos campos y deben seguir leyéndose. El DTO los exige al crear.
  @Prop({ type: String, trim: true }) opportunityRole?: string;
  @Prop({ type: [String] }) skills?: string[];
  @Prop({ type: String, trim: true }) roleDescription?: string;
  @Prop({ type: Number, min: PROCESS_BAND_MIN, max: PROCESS_BAND_MAX }) band?: number;
  @Prop({ type: String, required: true, index: true }) ownerPmId!: string;
  @Prop({ type: String, default: null, index: true }) recruiterId!: string | null;
  @Prop({ type: String, enum: PROCESS_STATUSES, default: DEFAULT_PROCESS_STATUS }) status!: TProcessStatus;
  @Prop({ type: [String], default: [] }) candidateIds!: string[];
  @Prop({ type: [String], default: [] }) technicalRefIds!: string[];
  @Prop({ type: SchemaFactory.createForClass(ProcessActorModel), required: true }) createdBy!: ProcessActorModel;

  createdAt!: Date;
  updatedAt!: Date;
}

export const ProcessSchema = SchemaFactory.createForClass(ProcessModel);
