import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import type { IAuthEventRepositoryPort } from '../../application/ports/auth-event-repository.port';
import type { IAuthEvent } from '../../domain/interfaces/auth-event.interface';
import { TraceFlow } from '../../../../shared/observability/trace-flow.decorator';
import { AuthEventModel, type AuthEventDocument } from './auth-event.schema';

@Injectable()
export class MongooseAuthEventAdapter implements IAuthEventRepositoryPort {
  constructor(
    @InjectModel(AuthEventModel.name) private readonly authEventModel: Model<AuthEventDocument>,
  ) {}

  @TraceFlow()
  async record(event: IAuthEvent): Promise<void> {
    await this.authEventModel.create({ ...event });
  }
}
