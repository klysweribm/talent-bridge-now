import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { AuthService } from '../../application/services/auth.service';
import type { IAuthToken } from '../../domain/interfaces/auth-token.interface';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let controller: AuthController;
  let fakeAuthService: Pick<AuthService, 'devLogin'>;
  let fakeConfigService: Pick<ConfigService, 'get'>;

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
    fakeConfigService = { get: jest.fn().mockReturnValue('development') };

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
    const result = await controller.devLogin({ email: AUTH_TOKEN.user.email });

    expect(fakeAuthService.devLogin).toHaveBeenCalledWith(AUTH_TOKEN.user.email);
    expect(result).toEqual(AUTH_TOKEN);
  });

  it('should throw NotFoundException without calling AuthService when NODE_ENV is production', async () => {
    (fakeConfigService.get as jest.Mock).mockReturnValue('production');

    await expect(controller.devLogin({ email: AUTH_TOKEN.user.email })).rejects.toThrow(
      NotFoundException,
    );
    expect(fakeAuthService.devLogin).not.toHaveBeenCalled();
  });

  it('should return ok true from the test-only whoami route', () => {
    expect(controller.whoami()).toEqual({ ok: true });
  });
});
