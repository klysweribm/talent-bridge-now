import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { AuthService } from '../../application/services/auth.service';
import type { IAuthToken } from '../../domain/interfaces/auth-token.interface';
import type { Request } from 'express';
import { AuthController } from './auth.controller';

const FAKE_REQ = { ip: '10.0.0.1', get: () => 'jest-agent' } as unknown as Request;

describe('AuthController', () => {
  let controller: AuthController;
  let fakeAuthService: Pick<AuthService, 'devLogin'>;
  let fakeConfigService: Pick<ConfigService, 'get'>;
  let fakeConfig: Record<string, string | undefined>;

  const AUTH_TOKEN: IAuthToken = {
    accessToken: 'signed-jwt',
    user: {
      id: 'u-1',
      email: 'ana@ibm.com',
      fullName: 'Ana García',
      role: 'recruiter',
      timezone: 'America/Bogota',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  };

  beforeEach(async () => {
    fakeAuthService = { devLogin: jest.fn().mockResolvedValue(AUTH_TOKEN) };
    fakeConfig = { NODE_ENV: 'development', AUTH_DEV_LOGIN_ENABLED: 'true' };
    fakeConfigService = { get: jest.fn((key: string) => fakeConfig[key]) };

    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: fakeAuthService },
        { provide: ConfigService, useValue: fakeConfigService },
      ],
    }).compile();

    controller = moduleRef.get(AuthController);
  });

  it('should call AuthService.devLogin and return the token when NODE_ENV is not production', async () => {
    const result = await controller.devLogin({ email: AUTH_TOKEN.user.email }, FAKE_REQ);

    expect(fakeAuthService.devLogin).toHaveBeenCalledWith(AUTH_TOKEN.user.email, {
      ip: '10.0.0.1',
      userAgent: 'jest-agent',
    });
    expect(result).toEqual(AUTH_TOKEN);
  });

  it.each([
    ['NODE_ENV is production even with the flag on', { NODE_ENV: 'production', AUTH_DEV_LOGIN_ENABLED: 'true' }],
    ['the flag is not defined', { NODE_ENV: 'development' }],
    ['NODE_ENV is not defined (fail closed)', {}],
    ['the flag is not exactly "true"', { NODE_ENV: 'development', AUTH_DEV_LOGIN_ENABLED: 'TRUE' }],
  ])('should throw NotFoundException without calling AuthService when %s', async (_label, env) => {
    fakeConfig = env;

    await expect(controller.devLogin({ email: AUTH_TOKEN.user.email }, FAKE_REQ)).rejects.toThrow(
      NotFoundException,
    );
    expect(fakeAuthService.devLogin).not.toHaveBeenCalled();
  });

  it('should return ok true from the test-only whoami route', () => {
    expect(controller.whoami()).toEqual({ ok: true });
  });
});
