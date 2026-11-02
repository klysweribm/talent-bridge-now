import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import type { TCandidateStatus, UserRole, TLanguageProficiency, TSeniority, TSkillLevelValue } from '@ibm-talent-bridge/shared-types';
import {
  CANDIDATE_LANGUAGE_LEVELS, CANDIDATE_SENIORITIES, CANDIDATE_SKILL_LEVELS,
} from '../../domain/constants/candidate.constants';

export type CandidateDocument = HydratedDocument<CandidateModel>;
const CANDIDATE_STATUSES: readonly TCandidateStatus[] = ['tentative'];
const CANDIDATE_ACTOR_ROLES: readonly UserRole[] = ['recruiter', 'pm', 'technical_ref'];

@Schema({ _id: false })
export class CandidateSkillModel {
  @Prop({ type: String, required: true, trim: true })
  name!: string;

  @Prop({ type: Number, enum: CANDIDATE_SKILL_LEVELS })
  level?: TSkillLevelValue;

  @Prop({ type: Number, min: 0 })
  years?: number;
}

@Schema({ _id: false })
export class CandidateLanguageModel {
  @Prop({ type: String, required: true })
  code!: string;

  @Prop({ type: String, required: true, enum: CANDIDATE_LANGUAGE_LEVELS })
  level!: TLanguageProficiency;
}

@Schema({ _id: false })
export class CandidateLocationModel {
  @Prop({ type: String }) country?: string;
  @Prop({ type: String }) city?: string;
}

@Schema({ _id: false })
export class CandidateEducationModel {
  @Prop({ type: String }) institution?: string;
  @Prop({ type: String }) degree?: string;
  @Prop({ type: Number }) year?: number;
}

@Schema({ _id: false })
export class CandidateExperienceModel {
  @Prop({ type: String }) company?: string;
  @Prop({ type: String }) role?: string;
  @Prop({ type: String }) from?: string;
  @Prop({ type: String }) to?: string;
  @Prop({ type: String }) summary?: string;
}

@Schema({ _id: false })
export class CandidateActorModel {
  @Prop({ type: String, required: true }) id!: string;
  @Prop({ type: String, required: true }) email!: string;
  @Prop({ type: String, required: true, enum: CANDIDATE_ACTOR_ROLES }) role!: UserRole;
}

/** Candidato externo. El email es único y se guarda en minúsculas (la unicidad no distingue mayúsculas). */
@Schema({ timestamps: true, collection: 'candidates' })
export class CandidateModel {
  @Prop({ type: String, required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ type: String, required: true, trim: true })
  fullName!: string;

  @Prop({ type: String, enum: CANDIDATE_STATUSES, required: true, default: 'tentative' })
  status!: TCandidateStatus;

  @Prop({ type: String }) phone?: string;
  @Prop({ type: String }) linkedIn?: string;
  @Prop({ type: String }) primaryRole?: string;
  @Prop({ type: String, enum: CANDIDATE_SENIORITIES }) seniority?: TSeniority;
  @Prop({ type: Number, min: 0 }) yearsExperience?: number;
  @Prop({ type: String }) summary?: string;
  @Prop({ type: SchemaFactory.createForClass(CandidateLocationModel) }) location?: CandidateLocationModel;
  @Prop({ type: [SchemaFactory.createForClass(CandidateSkillModel)] }) skills?: CandidateSkillModel[];
  @Prop({ type: [SchemaFactory.createForClass(CandidateLanguageModel)] }) languages?: CandidateLanguageModel[];
  @Prop({ type: [SchemaFactory.createForClass(CandidateEducationModel)] }) education?: CandidateEducationModel[];
  @Prop({ type: [SchemaFactory.createForClass(CandidateExperienceModel)] }) experience?: CandidateExperienceModel[];

  @Prop({ type: SchemaFactory.createForClass(CandidateActorModel) }) createdBy?: CandidateActorModel;
  @Prop({ type: SchemaFactory.createForClass(CandidateActorModel) }) updatedBy?: CandidateActorModel;
  @Prop({ type: Number, min: 0, default: 0 }) updateCount!: number;

  /** Claves de búsqueda internas (UC-CAND-6): nunca salen en las respuestas. */
  @Prop({ type: String, index: true }) nameKey?: string;
  @Prop({ type: String, index: true }) phoneKey?: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const CandidateSchema = SchemaFactory.createForClass(CandidateModel);
