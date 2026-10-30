import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import type {
  ILanguageLevel, ISkillLevel, TBenchStatus, TLanguageProficiency, TSeniority, TSkillLevelValue,
} from '@ibm-talent-bridge/shared-types';
import {
  BENCH_SENIORITIES, BENCH_STATUSES, LANGUAGE_PROFICIENCIES, SKILL_LEVEL_VALUES,
} from '../../domain/constants/bench.constants';

export type BenchResourceDocument = HydratedDocument<BenchResourceModel>;

@Schema({ _id: false })
export class SkillLevelModel implements ISkillLevel {
  @Prop({ type: String, required: true, trim: true })
  name!: string;

  @Prop({ type: Number, required: true, enum: SKILL_LEVEL_VALUES })
  level!: TSkillLevelValue;

  @Prop({ type: Number, required: true, min: 0 })
  years!: number;
}
const SkillLevelSchema = SchemaFactory.createForClass(SkillLevelModel);

@Schema({ _id: false })
export class LanguageLevelModel implements ILanguageLevel {
  @Prop({ type: String, required: true })
  code!: string;

  @Prop({ type: String, required: true, enum: LANGUAGE_PROFICIENCIES })
  level!: TLanguageProficiency;
}
const LanguageLevelSchema = SchemaFactory.createForClass(LanguageLevelModel);

@Schema({ _id: false })
export class BenchLocationModel {
  @Prop({ type: String, required: true })
  country!: string;

  @Prop({ type: String, required: true })
  city!: string;
}
const BenchLocationSchema = SchemaFactory.createForClass(BenchLocationModel);

@Schema({ timestamps: true, collection: 'bench_resources' })
export class BenchResourceModel {
  @Prop({ type: String, required: true, unique: true, trim: true })
  benchCode!: string;

  @Prop({ type: String, required: true })
  displayName!: string;

  @Prop({ type: String, required: true })
  primaryRole!: string;

  @Prop({ type: String, required: true })
  practice!: string;

  @Prop({ type: String, required: true, enum: BENCH_SENIORITIES, index: true })
  seniority!: TSeniority;

  @Prop({ type: [SkillLevelSchema], default: [] })
  skills!: SkillLevelModel[];

  @Prop({ type: [LanguageLevelSchema], default: [] })
  languages!: LanguageLevelModel[];

  @Prop({ type: BenchLocationSchema, required: true })
  location!: BenchLocationModel;

  @Prop({ type: Date, required: true })
  benchSince!: Date;

  @Prop({ type: Date, required: true, index: true })
  availableFrom!: Date;

  @Prop({ type: String, required: true, enum: BENCH_STATUSES, index: true })
  status!: TBenchStatus;
}

export const BenchResourceSchema = SchemaFactory.createForClass(BenchResourceModel);
BenchResourceSchema.index({ 'skills.name': 1 });
