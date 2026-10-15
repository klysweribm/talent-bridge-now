import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { ConnectionStates, type Connection } from 'mongoose';
import type { IDbStatusPort } from '../../application/ports/db-status.port';

@Injectable()
export class MongooseDbStatusAdapter implements IDbStatusPort {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  isUp(): boolean {
    return this.connection.readyState === ConnectionStates.connected;
  }
}
