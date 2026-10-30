import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import {
  AUTH_EVENT_TYPES,
  LOGOUT_REASONS,
  type TAuthEventType,
  type TLogoutReason,
} from '../../domain/interfaces/auth-event.interface';

export type AuthEventDocument = HydratedDocument<AuthEventModel>;

@Schema({ timestamps: true, collection: 'auth_events' })
export class AuthEventModel {
  @Prop({ type: String, required: true, index: true })
  userId!: string;

  // `type` explícito en uniones TS: sin él Mongoose crashea en runtime.
  @Prop({ type: String, required: true, enum: AUTH_EVENT_TYPES })
  type!: TAuthEventType;

  @Prop({ type: String, enum: LOGOUT_REASONS })
  reason?: TLogoutReason;

  // El índice TTL se añade en AuthModule (forFeatureAsync) con AUTH_EVENT_RETENTION_DAYS.
  @Prop({ type: Date, required: true })
  at!: Date;

  @Prop({ type: String })
  ip?: string;

  @Prop({ type: String })
  userAgent?: string;
}

export const AuthEventSchema = SchemaFactory.createForClass(AuthEventModel);
