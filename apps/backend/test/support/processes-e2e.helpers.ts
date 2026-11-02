import type { Server } from 'http';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getConnectionToken, getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import type { Connection, Model } from 'mongoose';
import * as request from 'supertest';
import type { UserRole } from '@ibm-talent-bridge/shared-types';
import { AuthModule } from '../../src/capabilities/auth/auth.module';
import { UserModel, type UserDocument } from '../../src/capabilities/auth/infrastructure/adapters/user.schema';
import { ProcessesModule } from '../../src/capabilities/processes/processes.module';
import { SharedAuthModule } from '../../src/shared/auth/shared-auth.module';

const TEST_JWT_SECRET = 'integration_secret_key_for_ci_only_32chars';
const RUN_ID = `${process.pid}-${Date.now()}`;
export const API = '/api/v1';

export interface IDemoUser { readonly id: string; readonly email: string; readonly role: UserRole; readonly fullName: string }
export interface IProcessesContext {
  readonly app: INestApplication<Server>;
  readonly jwt: JwtService;
  readonly users: Readonly<Record<'ana' | 'carlos' | 'mariana', IDemoUser>>;
}

/** ProcessesModule importa CandidatesModule (-> AiModule): config de IA falsa para que arranque sin el .env real. */
const AI_ENV: Record<string, string> = {
  AI_PROVIDER: 'ica', ICA_API_URL: 'http://ica.invalid/v1', ICA_API_KEY: 'test-key-not-real', ICA_MODEL_ID: 'test-model',
  ICA_MAX_TOKENS: '256', ICA_TIMEOUT_MS: '1000', AI_RETRY_MAX_ATTEMPTS: '1', AI_RETRY_BASE_MS: '1', AI_RETRY_MAX_MS: '1',
  AI_TOTAL_TIMEOUT_MS: '2000', CV_MAX_FILE_BYTES: '4096',
};

const DEMO_EMAILS = { ana: 'ana@ibm.com', carlos: 'carlos@ibm.com', mariana: 'mariana@ibm.com' } as const;

export async function buildProcessesApp(label: string): Promise<IProcessesContext> {
  Object.assign(process.env, { NODE_ENV: 'development', AUTH_DEV_LOGIN_ENABLED: 'true', JWT_SECRET: TEST_JWT_SECRET, MAX_CANDIDATES_PER_PROCESS: '7', ...AI_ENV });
  const moduleRef = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '../../.env'] }),
      MongooseModule.forRootAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({ uri: config.getOrThrow<string>('MONGODB_URI'), dbName: `talent-bridge-proc-it-${label}-${RUN_ID}` }),
      }),
      SharedAuthModule,
      AuthModule,
      ProcessesModule,
    ],
  }).compile();
  const app = moduleRef.createNestApplication<INestApplication<Server>>();
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  await app.init(); // el seeder de usuarios demo corre en onModuleInit
  const model = app.get<Model<UserDocument>>(getModelToken(UserModel.name));
  const find = async (email: string): Promise<IDemoUser> => {
    const doc = await model.findOne({ email }).orFail().exec();
    return { id: doc._id.toString(), email: doc.email, role: doc.role, fullName: doc.fullName };
  };
  const users = { ana: await find(DEMO_EMAILS.ana), carlos: await find(DEMO_EMAILS.carlos), mariana: await find(DEMO_EMAILS.mariana) };
  return { app, jwt: moduleRef.get(JwtService), users };
}

export async function closeProcessesApp(ctx: IProcessesContext): Promise<void> {
  await ctx.app.get<Connection>(getConnectionToken()).dropDatabase();
  await ctx.app.close();
  for (const key of ['NODE_ENV', 'AUTH_DEV_LOGIN_ENABLED', 'MAX_CANDIDATES_PER_PROCESS', ...Object.keys(AI_ENV)]) delete process.env[key];
}

/** Petición firmada con el id REAL del usuario demo (el servicio toma el autor del JWT). */
export function as(ctx: IProcessesContext, user: IDemoUser | undefined, method: 'get' | 'post' | 'put' | 'delete', path: string): request.Test {
  const call = request(ctx.app.getHttpServer())[method](`${API}${path}`);
  if (!user) return call;
  return call.set('Authorization', `Bearer ${ctx.jwt.sign({ sub: user.id, email: user.email, role: user.role })}`);
}

/** Crea un candidato por HTTP (lo carga `uploader`, que no tiene por qué ser dueño del proceso) y devuelve su id. */
export async function createCandidate(ctx: IProcessesContext, uploader: IDemoUser, name: string): Promise<string> {
  const email = `${name.toLowerCase().replace(/\s+/g, '.')}.${Date.now()}.${Math.random().toString(36).slice(2, 7)}@example.test`;
  const response = await as(ctx, uploader, 'post', '/candidates').send({ email, fullName: name, primaryRole: 'Backend' }).expect(201);
  return (response.body as { id: string }).id;
}
