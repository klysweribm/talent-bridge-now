import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './capabilities/auth/auth.module';
import { HealthModule } from './monitoring/health.module';
import { SharedAuthModule } from './shared/auth/shared-auth.module';

const DEFAULT_THROTTLE_TTL_SECONDS = 60;
const DEFAULT_THROTTLE_LIMIT = 100;
const MS_PER_SECOND = 1000;

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
            // THROTTLE_TTL se documenta en segundos (.env.example); throttler v5 espera ms.
            ttl:
              configService.get<number>('THROTTLE_TTL', DEFAULT_THROTTLE_TTL_SECONDS) *
              MS_PER_SECOND,
            limit: configService.get<number>('THROTTLE_LIMIT', DEFAULT_THROTTLE_LIMIT),
          },
        ],
      }),
    }),
    SharedAuthModule,
    HealthModule,
    AuthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
