import type { Server } from 'http';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import type { User } from '@ibm-talent-bridge/shared-types';
import { AuthModule } from '../src/capabilities/auth/auth.module';
import { AUTH_EVENT_REPOSITORY_PORT } from '../src/capabilities/auth/application/ports/auth-event-repository.port';
import { USER_REPOSITORY_PORT } from '../src/capabilities/auth/application/ports/user-repository.port';
import { DemoUsersSeeder } from '../src/capabilities/auth/infrastructure/seed/demo-users.seeder';
import { SharedAuthModule } from '../src/shared/auth/shared-auth.module';

const USER: User = {
  id: 'u-3',
  email: 'mariana@ibm.com',
  fullName: 'Mariana',
  role: 'pm',
  timezone: 'America/Bogota',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

async function buildApp(
  record: jest.Mock,
): Promise<{ app: INestApplication<Server>; token: string }> {
  process.env.NODE_ENV = 'development';
  process.env.JWT_SECRET = 'test_secret_key_for_ci_only_32chars';
  const moduleRef = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '../../.env'] }),
      MongooseModule.forRootAsync({
        inject: [ConfigService],
        useFactory: (c: ConfigService) => ({ uri: c.getOrThrow<string>('MONGODB_URI') }),
      }),
      SharedAuthModule,
      AuthModule,
    ],
  })
    .overrideProvider(USER_REPOSITORY_PORT)
    .useValue({ findByEmail: jest.fn() })
    .overrideProvider(AUTH_EVENT_REPOSITORY_PORT)
    .useValue({ record })
    .overrideProvider(DemoUsersSeeder)
    .useValue({})
    .compile();
  const app = moduleRef.createNestApplication<INestApplication<Server>>();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.init();
  const payload = { sub: USER.id, email: USER.email, role: USER.role };
  return { app, token: moduleRef.get(JwtService).sign(payload) };
}

/** POST /auth/logout (QW-2). Los puertos van con fakes; el token se emite en el test con el servicio JWT. */
describe('Auth logout (e2e)', () => {
  const record = jest.fn();
  let app: INestApplication<Server>;
  let token: string;

  beforeAll(async () => {
    const built = await buildApp(record);
    app = built.app;
    token = built.token;
  });

  const logoutAs = (jwt: string, body: object): request.Test =>
    request(app.getHttpServer()).post('/auth/logout').set('Authorization', `Bearer ${jwt}`).send(body);

  beforeEach(() => record.mockReset().mockResolvedValue(undefined));
  afterAll(async () => {
    await app.close();
    delete process.env.NODE_ENV;
  });

  it('should return 401 without a token', async () => {
    await request(app.getHttpServer()).post('/auth/logout').send({ reason: 'x' }).expect(401);
    expect(record).not.toHaveBeenCalled();
  });

  it('should return 400 when reason is invalid', async () => {
    await logoutAs(token, { reason: 'nope' }).expect(400);
    expect(record).not.toHaveBeenCalled();
  });

  it('should return 204 and record a logout event for a non-recruiter role', async () => {
    await logoutAs(token, { reason: 'idle' }).expect(204);
    expect(record).toHaveBeenCalledWith(expect.objectContaining({ userId: 'u-3', reason: 'idle' }));
  });
});
