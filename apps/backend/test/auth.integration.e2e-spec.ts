import type { Server } from 'http';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getConnectionToken, getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import type { Connection, Model } from 'mongoose';
import * as request from 'supertest';
import type { UserRole } from '@ibm-talent-bridge/shared-types';
import { AuthModule } from '../src/capabilities/auth/auth.module';
import type { IAuthToken } from '../src/capabilities/auth/domain/interfaces/auth-token.interface';
import { UserModel, type UserDocument } from '../src/capabilities/auth/infrastructure/adapters/user.schema';
import { DEMO_USERS_SEED } from '../src/capabilities/auth/infrastructure/seed/demo-users.seed-data';
import { DemoUsersSeeder } from '../src/capabilities/auth/infrastructure/seed/demo-users.seeder';
import type { IJwtPayload } from '../src/shared/auth/jwt-payload.interface';
import { SharedAuthModule } from '../src/shared/auth/shared-auth.module';

/**
 * Integración AUTH-1 de punta a punta: pipeline HTTP real (prefijo + ValidationPipe
 * como `main.ts`) + `AuthModule` COMPLETO contra MongoDB real — adapter Mongoose,
 * schema y seeder reales, sin fakes. Cubre lo que el e2e con fakes no puede ver
 * (p. ej. el `@Prop` de unión que crashea en runtime, el índice único, el seed).
 *
 * Requiere `MONGODB_URI` (docker-compose / docker-compose.test.yml). Usa una base
 * de datos descartable propia (`dbName`) que se elimina al terminar, para no tocar
 * los datos de desarrollo.
 */
const TEST_JWT_SECRET = 'integration_secret_key_for_ci_only_32chars';
const TEST_DB_NAME = `talent-bridge-auth-it-${process.pid}-${Date.now()}`;
const API_PREFIX = '/api/v1';
const LOGIN_PATH = `${API_PREFIX}/auth/dev-login`;
const WHOAMI_PATH = `${API_PREFIX}/auth/whoami`;
const SECONDS_IN_ONE_HOUR = 3600;
const ALREADY_EXPIRED_SECONDS = -10;

jest.setTimeout(30_000);

type TDecodedJwt = IJwtPayload & { readonly exp: number; readonly iat: number };

interface ITestContext {
  readonly app: INestApplication<Server>;
  readonly jwtService: JwtService;
}

async function buildApp(nodeEnv: string): Promise<ITestContext> {
  process.env.NODE_ENV = nodeEnv;
  process.env.JWT_SECRET = TEST_JWT_SECRET;

  const moduleRef = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '../../.env'] }),
      MongooseModule.forRootAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          uri: configService.getOrThrow<string>('MONGODB_URI'),
          dbName: TEST_DB_NAME,
        }),
      }),
      SharedAuthModule,
      AuthModule,
    ],
  }).compile();

  const app = moduleRef.createNestApplication<INestApplication<Server>>();
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  await app.init();

  return { app, jwtService: moduleRef.get(JwtService) };
}

async function login(app: INestApplication<Server>, email: string): Promise<IAuthToken> {
  const response = await request(app.getHttpServer()).post(LOGIN_PATH).send({ email }).expect(201);
  return response.body as IAuthToken;
}

function whoami(app: INestApplication<Server>, authorization?: string): request.Test {
  const call = request(app.getHttpServer()).get(WHOAMI_PATH);
  return authorization ? call.set('Authorization', authorization) : call;
}

describe('Auth integration (real Mongo adapter + seeder + HTTP pipeline)', () => {
  describe('development', () => {
    let context: ITestContext;

    beforeAll(async () => {
      context = await buildApp('development');
    });

    afterAll(async () => {
      await context.app.get<Connection>(getConnectionToken()).dropDatabase();
      await context.app.close();
      delete process.env.NODE_ENV;
    });

    describe('seed', () => {
      it('should persist the three demo users with their roles on module init', async () => {
        const userModel = context.app.get<Model<UserDocument>>(getModelToken(UserModel.name));

        const stored = await userModel.find().lean().exec();

        expect(stored).toHaveLength(DEMO_USERS_SEED.length);
        expect(
          stored.map(({ email, role }) => ({ email, role })).sort((a, b) => a.email.localeCompare(b.email)),
        ).toEqual(
          DEMO_USERS_SEED.map(({ email, role }) => ({ email, role })).sort((a, b) =>
            a.email.localeCompare(b.email),
          ),
        );
      });

      it('should not duplicate users when the seeder runs again', async () => {
        const userModel = context.app.get<Model<UserDocument>>(getModelToken(UserModel.name));

        await context.app.get(DemoUsersSeeder).onModuleInit();

        expect(await userModel.countDocuments().exec()).toBe(DEMO_USERS_SEED.length);
      });
    });

    describe('dev-login', () => {
      it.each(DEMO_USERS_SEED.map(({ email, role }) => [email, role] as const))(
        'should issue a signed JWT carrying the stored identity and role when %s logs in (%s)',
        async (email, role) => {
          const { accessToken, user } = await login(context.app, email);

          const payload = context.jwtService.verify<TDecodedJwt>(accessToken);
          expect(payload).toMatchObject({ sub: user.id, email, role });
          expect(payload.exp - payload.iat).toBe(SECONDS_IN_ONE_HOUR);
          expect(user).toMatchObject({ email, role });
        },
      );

      it('should accept the email in any letter case', async () => {
        const { user } = await login(context.app, 'ANA@IBM.COM');

        expect(user.email).toBe('ana@ibm.com');
      });

      it('should return 401 when the email has no seeded user', async () => {
        await request(context.app.getHttpServer())
          .post(LOGIN_PATH)
          .send({ email: 'desconocido@ibm.com' })
          .expect(401);
      });

      it.each([
        ['an invalid email', { email: 'not-an-email' }],
        ['a missing email', {}],
        ['an unexpected extra property', { email: 'ana@ibm.com', role: 'pm' }],
      ])('should return 400 when the body has %s', async (_label, body) => {
        await request(context.app.getHttpServer()).post(LOGIN_PATH).send(body).expect(400);
      });
    });

    describe('session usage (login → guarded route)', () => {
      it('should let the recruiter reach the guarded route with the token it was issued', async () => {
        const { accessToken } = await login(context.app, 'ana@ibm.com');

        const response = await whoami(context.app, `Bearer ${accessToken}`).expect(200);

        expect(response.body).toEqual({ ok: true });
      });

      it.each([['carlos@ibm.com'], ['mariana@ibm.com']])(
        'should return 403 when %s (valid session, wrong role) reaches the recruiter-only route',
        async (email) => {
          const { accessToken } = await login(context.app, email);

          await whoami(context.app, `Bearer ${accessToken}`).expect(403);
        },
      );
    });

    describe('token rejection', () => {
      const recruiterPayload = (): IJwtPayload =>
        ({ sub: 'u-1', email: 'ana@ibm.com', role: 'recruiter' as UserRole }) as IJwtPayload;

      it('should return 401 when no Authorization header is sent', async () => {
        await whoami(context.app).expect(401);
      });

      it('should return 401 when the header is not a Bearer token', async () => {
        const { accessToken } = await login(context.app, 'ana@ibm.com');

        await whoami(context.app, accessToken).expect(401);
      });

      it('should return 401 when the token is garbage', async () => {
        await whoami(context.app, 'Bearer not.a.jwt').expect(401);
      });

      it('should return 401 when the token was signed with another secret', async () => {
        const forged = new JwtService({ secret: 'some_other_secret_key_32_chars_long!' }).sign(
          recruiterPayload(),
        );

        await whoami(context.app, `Bearer ${forged}`).expect(401);
      });

      it('should return 401 when the token payload was tampered after signing', async () => {
        const { accessToken } = await login(context.app, 'mariana@ibm.com');
        const [header, , signature] = accessToken.split('.');
        const forgedPayload = Buffer.from(JSON.stringify({ ...recruiterPayload() })).toString('base64url');

        await whoami(context.app, `Bearer ${header}.${forgedPayload}.${signature}`).expect(401);
      });

      it('should return 401 when the token is expired', async () => {
        const expired = context.jwtService.sign(recruiterPayload(), {
          expiresIn: ALREADY_EXPIRED_SECONDS,
        });

        await whoami(context.app, `Bearer ${expired}`).expect(401);
      });
    });
  });

  describe('production', () => {
    let context: ITestContext;

    beforeAll(async () => {
      context = await buildApp('production');
    });

    afterAll(async () => {
      await context.app.get<Connection>(getConnectionToken()).dropDatabase();
      await context.app.close();
      delete process.env.NODE_ENV;
    });

    it('should return 404 on dev-login even for a seeded user, issuing no token', async () => {
      const response = await request(context.app.getHttpServer())
        .post(LOGIN_PATH)
        .send({ email: 'ana@ibm.com' })
        .expect(404);

      expect(response.body).not.toHaveProperty('accessToken');
    });
  });
});
