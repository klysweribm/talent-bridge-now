import type { Server } from 'http';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { INestApplication } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import type { User } from '@ibm-talent-bridge/shared-types';
import type { IAuthToken } from '../src/capabilities/auth/domain/interfaces/auth-token.interface';
import { AuthModule } from '../src/capabilities/auth/auth.module';
import { USER_REPOSITORY_PORT, type IUserRepositoryPort } from '../src/capabilities/auth/application/ports/user-repository.port';
import { DemoUsersSeeder } from '../src/capabilities/auth/infrastructure/seed/demo-users.seeder';
import { SharedAuthModule } from '../src/shared/auth/shared-auth.module';

/**
 * Exercises the real HTTP pipeline for AUTH-1 (dev-login + guarded route).
 * `USER_REPOSITORY_PORT` is overridden with an in-memory fake and
 * `DemoUsersSeeder` is overridden to a no-op, so no demo data needs to
 * exist — but `AuthModule` still declares `MongooseModule.forFeature(...)`
 * for `UserModel`, which needs a real Mongo connection to resolve
 * (`docker-compose.yml`/`docker-compose.test.yml` — see `MONGODB_URI`).
 */
describe('Auth (e2e)', () => {
  const DEMO_USER: User = {
    id: 'u-1',
    email: 'ana@ibm.com',
    fullName: 'Ana García',
    role: 'recruiter',
    timezone: 'America/Bogota',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  const fakeUserRepository: IUserRepositoryPort = {
    findByEmail: jest.fn((email: string) =>
      Promise.resolve(email === DEMO_USER.email ? DEMO_USER : null),
    ),
  };

  async function buildApp(nodeEnv: string): Promise<INestApplication<Server>> {
    process.env.NODE_ENV = nodeEnv;
    process.env.JWT_SECRET = 'test_secret_key_for_ci_only_32chars';

    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '../../.env'] }),
        MongooseModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            uri: configService.getOrThrow<string>('MONGODB_URI'),
          }),
        }),
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

  afterEach(() => {
    delete process.env.NODE_ENV;
  });

  it('should return a JWT with the correct role for a seeded demo email', async () => {
    const app = await buildApp('development');

    const response = await request(app.getHttpServer())
      .post('/auth/dev-login')
      .send({ email: DEMO_USER.email })
      .expect(201);

    const body = response.body as IAuthToken;
    expect(body.user.role).toBe('recruiter');
    expect(typeof body.accessToken).toBe('string');

    await app.close();
  });

  it('should return 401 for an email with no seeded user', async () => {
    const app = await buildApp('development');

    await request(app.getHttpServer())
      .post('/auth/dev-login')
      .send({ email: 'desconocido@ibm.com' })
      .expect(401);

    await app.close();
  });

  it('should return 404 when NODE_ENV is production', async () => {
    const app = await buildApp('production');

    await request(app.getHttpServer())
      .post('/auth/dev-login')
      .send({ email: DEMO_USER.email })
      .expect(404);

    await app.close();
  });

  it('should return 401 on the guarded route without a token', async () => {
    const app = await buildApp('development');

    await request(app.getHttpServer()).get('/auth/whoami').expect(401);

    await app.close();
  });

  it('should return 403 on the guarded route with a token for a non-recruiter role', async () => {
    const app = await buildApp('development');
    const pmUser: User = { ...DEMO_USER, id: 'u-3', email: 'mariana@ibm.com', role: 'pm' };
    (fakeUserRepository.findByEmail as jest.Mock).mockResolvedValueOnce(pmUser);

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/dev-login')
      .send({ email: pmUser.email })
      .expect(201);
    const { accessToken } = loginResponse.body as IAuthToken;

    await request(app.getHttpServer())
      .get('/auth/whoami')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(403);

    await app.close();
  });

  it('should return 200 on the guarded route with a token for the recruiter role', async () => {
    const app = await buildApp('development');

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/dev-login')
      .send({ email: DEMO_USER.email })
      .expect(201);
    const { accessToken } = loginResponse.body as IAuthToken;

    await request(app.getHttpServer())
      .get('/auth/whoami')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    await app.close();
  });
});
