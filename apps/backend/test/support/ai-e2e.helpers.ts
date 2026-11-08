import type { Server } from 'http';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import type { Connection } from 'mongoose';
import * as request from 'supertest';
import type { UserRole } from '@ibm-talent-bridge/shared-types';
import { AiModule } from '../../src/capabilities/ai/ai.module';
import { AI_PROVIDER_PORT, type IAiProviderPort } from '../../src/capabilities/ai/application/ports/ai-provider.port';
import { AuthModule } from '../../src/capabilities/auth/auth.module';
import { BenchModule } from '../../src/capabilities/bench/bench.module';
import { CandidatesModule } from '../../src/capabilities/candidates/candidates.module';
import { SharedAuthModule } from '../../src/shared/auth/shared-auth.module';

export const FAKE_KEY = 'test-key-not-real';
export const API = '/api/v1';
const TEST_JWT_SECRET = 'integration_secret_key_for_ci_only_32chars';
const RUN_ID = `${process.pid}-${Date.now()}`;

/** Variables que el e2e fija a mano: así el .env real (con clave real) nunca interviene. */
const BASE_ENV: Record<string, string> = {
  NODE_ENV: 'development',
  AUTH_DEV_LOGIN_ENABLED: 'true',
  BENCH_SEED_ENABLED: 'true',
  AI_PROVIDER: 'ica',
  ICA_API_URL: 'http://ica.invalid/v1',
  ICA_API_KEY: FAKE_KEY,
  ICA_MODEL_ID: 'test-model',
  ICA_MAX_TOKENS: '256',
  ICA_TIMEOUT_MS: '1000',
  AI_RETRY_MAX_ATTEMPTS: '1',
  AI_RETRY_BASE_MS: '1',
  AI_RETRY_MAX_MS: '1',
  AI_TOTAL_TIMEOUT_MS: '2000',
  CV_MAX_FILE_BYTES: '4096',
  OPPORTUNITY_DRAFT_MAX_TEXT_CHARS: '200',
  OPPORTUNITY_DRAFT_TIMEOUT_MS: '1500',
};

export interface IAiTestContext {
  readonly app: INestApplication<Server>;
  readonly jwt: JwtService;
}

function testImports(label: string): unknown[] {
  return [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '../../.env'] }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>('MONGODB_URI'),
        dbName: `talent-bridge-ai-it-${label}-${RUN_ID}`,
      }),
    }),
    SharedAuthModule,
    AuthModule,
    BenchModule,
    AiModule,
    CandidatesModule,
  ];
}

export async function buildAiApp(
  label: string,
  port: IAiProviderPort,
  env: Record<string, string> = {},
): Promise<IAiTestContext> {
  Object.assign(process.env, BASE_ENV, env, { JWT_SECRET: TEST_JWT_SECRET });
  const moduleRef = await Test.createTestingModule({ imports: testImports(label) as never })
    .overrideProvider(AI_PROVIDER_PORT)
    .useValue(port)
    .compile();
  const app = moduleRef.createNestApplication<INestApplication<Server>>();
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  await app.init();
  return { app, jwt: moduleRef.get(JwtService) };
}

export async function closeAiApp(context: IAiTestContext): Promise<void> {
  await context.app.get<Connection>(getConnectionToken()).dropDatabase();
  await context.app.close();
  for (const key of Object.keys(BASE_ENV)) delete process.env[key];
}

export function authed(context: IAiTestContext, call: request.Test, role: UserRole): request.Test {
  const token = context.jwt.sign({ sub: 'u-1', email: `${role}@example.test`, role });
  return call.set('Authorization', `Bearer ${token}`);
}

export const http = (context: IAiTestContext): ReturnType<typeof request> => request(context.app.getHttpServer());
