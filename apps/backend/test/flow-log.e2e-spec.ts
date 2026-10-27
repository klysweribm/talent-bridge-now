import type { Server } from 'http';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Logger, type INestApplication } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import type { User } from '@ibm-talent-bridge/shared-types';
import { AuthModule } from '../src/capabilities/auth/auth.module';
import { USER_REPOSITORY_PORT, type IUserRepositoryPort } from '../src/capabilities/auth/application/ports/user-repository.port';
import { DemoUsersSeeder } from '../src/capabilities/auth/infrastructure/seed/demo-users.seeder';
import { SharedAuthModule } from '../src/shared/auth/shared-auth.module';
import { FlowLogModule } from '../src/shared/observability/flow-log.module';

/** Requires a reachable MONGODB_URI, like the other e2e specs (AuthModule registers UserModel). */
describe('FlowLog (e2e)', () => {
  const DEMO_USER: User = {
    id: 'u-1',
    email: 'ana@ibm.com',
    fullName: 'Ana García',
    role: 'recruiter',
    timezone: 'America/Bogota',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
  const SEEDED_SECRET = 'fake-seeded-secret-value';
  const fakeUserRepository: IUserRepositoryPort = {
    findByEmail: jest.fn((email: string) => Promise.resolve(email === DEMO_USER.email ? DEMO_USER : null)),
  };
  let logSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;

  async function buildApp(nodeEnv: string, flag: string): Promise<INestApplication<Server>> {
    process.env.NODE_ENV = nodeEnv;
    process.env.AUTH_DEV_LOGIN_ENABLED = 'true';
    process.env.JWT_SECRET = 'test_secret_key_for_ci_only_32chars';
    process.env.FLOW_LOG_ENABLED = flag;

    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '../../.env'] }),
        MongooseModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({ uri: configService.getOrThrow<string>('MONGODB_URI') }),
        }),
        FlowLogModule,
        SharedAuthModule,
        AuthModule,
      ],
    })
      .overrideProvider(USER_REPOSITORY_PORT)
      .useValue(fakeUserRepository)
      .overrideProvider(DemoUsersSeeder)
      .useValue({ onModuleInit: jest.fn() })
      .compile();

    const app = moduleRef.createNestApplication();
    await app.init();
    return app;
  }

  const output = (spy: jest.SpyInstance): string => (spy.mock.calls as unknown[][]).map((call) => String(call[0])).join('\n');

  beforeEach(() => {
    logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  });
  afterEach(() => {
    logSpy.mockRestore();
    warnSpy.mockRestore();
    delete process.env.NODE_ENV;
    delete process.env.AUTH_DEV_LOGIN_ENABLED;
    delete process.env.FLOW_LOG_ENABLED;
  });

  it('should print request, adapter steps and response for dev-login when enabled', async () => {
    const app = await buildApp('development', 'true');
    await request(app.getHttpServer()).post('/auth/dev-login').send({ email: DEMO_USER.email }).expect(201);

    const text = output(logSpy);
    expect(text).toContain('capability: auth');
    expect(text).toContain('Request:');
    expect(text).toContain('AuthService.devLogin');
    expect(text).toContain('status: 201');
    expect(text).toContain('"accessToken":"[REDACTED]"');
    await app.close();
  });

  it('should print the 401 from the middleware with the pre-handler note', async () => {
    const app = await buildApp('development', 'true');
    await request(app.getHttpServer()).get('/auth/whoami').expect(401);

    const text = output(logSpy);
    expect(text).toContain('status: 401');
    expect(text).toContain('rechazada antes del handler');
    await app.close();
  });

  it('should never print a seeded secret from the body', async () => {
    const app = await buildApp('development', 'true');
    await request(app.getHttpServer())
      .post('/auth/dev-login')
      .send({ email: DEMO_USER.email, password: SEEDED_SECRET });

    expect(output(logSpy)).not.toContain(SEEDED_SECRET);
    await app.close();
  });

  it('should not log anything when the flag is not exactly true', async () => {
    const app = await buildApp('development', 'false');
    await request(app.getHttpServer()).post('/auth/dev-login').send({ email: DEMO_USER.email }).expect(201);

    expect(output(logSpy)).not.toContain('Request:');
    await app.close();
  });

  it('should stay silent and warn at startup in production with the flag on', async () => {
    const app = await buildApp('production', 'true');
    await request(app.getHttpServer()).get('/auth/whoami');

    expect(output(logSpy)).not.toContain('Request:');
    expect(output(warnSpy)).toContain('FLOW_LOG_ENABLED ignorado');
    await app.close();
  });
});
