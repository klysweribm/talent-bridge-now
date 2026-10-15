import { Module } from '@nestjs/common';
import { DB_STATUS_PORT } from './application/ports/db-status.port';
import { HealthController } from './health.controller';
import { MongooseDbStatusAdapter } from './infrastructure/adapters/mongoose-db-status.adapter';

@Module({
  controllers: [HealthController],
  providers: [
    {
      provide: DB_STATUS_PORT,
      useClass: MongooseDbStatusAdapter,
    },
  ],
})
export class HealthModule {}
