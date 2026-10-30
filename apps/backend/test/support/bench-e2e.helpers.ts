import type { Server } from 'http';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getConnectionToken, getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import type { Connection, Model } from 'mongoose';
import * as request from 'supertest';
import type { IBenchResource, PaginatedResponse, UserRole } from '@ibm-talent-bridge/shared-types';
import { BenchModule } from '../../src/capabilities/bench/bench.module';
import {
  BenchResourceModel, type BenchResourceDocument,
} from '../../src/capabilities/bench/infrastructure/adapters/bench-resource.schema';
import { BENCH_SEED_RAW } from '../../src/capabilities/bench/infrastructure/seed/bench-seed.source';
import {
  validateBenchSeed, type TBenchSeedItem,
} from '../../src/capabilities/bench/infrastructure/seed/bench-seed.validator';
import { SharedAuthModule } from '../../src/shared/auth/shared-auth.module';

const TEST_JWT_SECRET = 'integration_secret_key_for_ci_only_32chars';
const BENCH = '/api/v1/bench';

export const RUN_ID = `${process.pid}-${Date.now()}`;
export const SEED: readonly TBenchSeedItem[] = validateBenchSeed(BENCH_SEED_RAW);
export const VISIBLE = SEED.filter((item) => item.status !== 'assigned');
export const DEFAULT_PAGE_SIZE = 20;

export type TPage = PaginatedResponse<IBenchResource>;
export interface ITestContext {
  readonly app: INestApplication<Server>;
  readonly jwt: JwtService;
}

function setEnv(key: string, value: string | undefined): void {
  if (value === undefined) delete process.env[key];
  else process.env[key] = value;
}

export function cleanEnv(): void {
  delete process.env.NODE_ENV;
  delete process.env.BENCH_SEED_ENABLED;
}

export async function buildApp(dbName: string, nodeEnv: string | undefined, flag?: string): Promise<ITestContext> {
  setEnv('NODE_ENV', nodeEnv);
  setEnv('BENCH_SEED_ENABLED', flag);
  process.env.JWT_SECRET = TEST_JWT_SECRET;
  const moduleRef = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '../../.env'] }),
      MongooseModule.forRootAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({ uri: config.getOrThrow<string>('MONGODB_URI'), dbName }),
      }),
      SharedAuthModule,
      BenchModule,
    ],
  }).compile();
  const app = moduleRef.createNestApplication<INestApplication<Server>>();
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  await app.init();
  return { app, jwt: moduleRef.get(JwtService) };
}

export async function dropAndClose(context: ITestContext): Promise<void> {
  await context.app.get<Connection>(getConnectionToken()).dropDatabase();
  await context.app.close();
}

export const benchModel = (context: ITestContext): Model<BenchResourceDocument> =>
  context.app.get<Model<BenchResourceDocument>>(getModelToken(BenchResourceModel.name));

export const countDocs = (context: ITestContext): Promise<number> => benchModel(context).countDocuments().exec();

export function get(context: ITestContext, path: string, role?: UserRole): request.Test {
  const call = request(context.app.getHttpServer()).get(`${BENCH}${path}`);
  if (!role) return call;
  const token = context.jwt.sign({ sub: 'u-1', email: `${role}@example.test`, role });
  return call.set('Authorization', `Bearer ${token}`);
}

export async function page(context: ITestContext, query: string): Promise<TPage> {
  return (await get(context, query, 'recruiter').expect(200)).body as TPage;
}

export const skillNames = (item: IBenchResource): readonly string[] => item.skills.map((skill) => skill.name);

/** Registra beforeAll/afterAll con una app + BD descartable propia; devuelve un ref con el contexto. */
export function useBenchApp(label: string, nodeEnv = 'development', flag: string | undefined = 'true'): { ctx: ITestContext } {
  const ref = {} as { ctx: ITestContext };
  beforeAll(async () => {
    ref.ctx = await buildApp(`talent-bridge-bench-it-${label}-${RUN_ID}`, nodeEnv, flag);
  });
  afterAll(async () => {
    await dropAndClose(ref.ctx);
    cleanEnv();
  });
  return ref;
}
