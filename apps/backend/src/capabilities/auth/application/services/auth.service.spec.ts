import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import type { User } from '@ibm-talent-bridge/shared-types';
import { AUTH_EVENT_REPOSITORY_PORT } from '../ports/auth-event-repository.port';
import { USER_REPOSITORY_PORT, type IUserRepositoryPort } from '../ports/user-repository.port';
import { AuthService } from './auth.service';

const DEMO_USER: User = {
  id: 'u-1',
  email: 'ana@ibm.com',
  fullName: 'Ana García',
  role: 'recruiter',
  timezone: 'America/Bogota',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('AuthService', () => {
  let service: AuthService;
  let fakeUserRepository: IUserRepositoryPort;
  let signMock: jest.Mock;

  beforeEach(async () => {
    fakeUserRepository = { findByEmail: jest.fn() };
    signMock = jest.fn().mockReturnValue('signed-jwt');

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: USER_REPOSITORY_PORT, useValue: fakeUserRepository },
        { provide: AUTH_EVENT_REPOSITORY_PORT, useValue: { record: jest.fn() } },
        { provide: JwtService, useValue: { sign: signMock } },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  });

  it('should return an access token and the user when the email belongs to a seeded user', async () => {
    (fakeUserRepository.findByEmail as jest.Mock).mockResolvedValue(DEMO_USER);

    const result = await service.devLogin(DEMO_USER.email);

    expect(result).toEqual({ accessToken: 'signed-jwt', user: DEMO_USER });
    expect(signMock).toHaveBeenCalledWith({ sub: 'u-1', email: 'ana@ibm.com', role: 'recruiter' });
  });

  it('should embed the correct role in the signed payload for each demo role', async () => {
    const pmUser: User = { ...DEMO_USER, id: 'u-3', email: 'mariana@ibm.com', role: 'pm' };
    (fakeUserRepository.findByEmail as jest.Mock).mockResolvedValue(pmUser);

    await service.devLogin(pmUser.email);

    expect(signMock).toHaveBeenCalledWith(expect.objectContaining({ role: 'pm' }));
  });

  it('should throw UnauthorizedException when the email has no seeded user', async () => {
    (fakeUserRepository.findByEmail as jest.Mock).mockResolvedValue(null);

    await expect(service.devLogin('desconocido@ibm.com')).rejects.toThrow(UnauthorizedException);
    expect(signMock).not.toHaveBeenCalled();
  });
});
