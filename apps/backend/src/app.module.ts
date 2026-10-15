import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { HealthModule } from './monitoring/health.module';

const DEFAULT_THROTTLE_TTL_MS = 60_000;
const DEFAULT_THROTTLE_LIMIT = 100;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // apps/backend/.env (si existe) y luego el .env de la raíz del monorepo,
      // para que `npm run start:dev` funcione fuera de Docker sin duplicar archivos.
      envFilePath: ['.env', '../../.env'],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>('MONGODB_URI'),
      }),
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: configService.get<number>('THROTTLE_TTL', DEFAULT_THROTTLE_TTL_MS),
            limit: configService.get<number>('THROTTLE_LIMIT', DEFAULT_THROTTLE_LIMIT),
          },
        ],
      }),
    }),
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
