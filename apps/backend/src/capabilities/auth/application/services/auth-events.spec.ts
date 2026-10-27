import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import type { User } from '@ibm-talent-bridge/shared-types';
import {
  AUTH_EVENT_REPOSITORY_PORT,
  type IAuthEventRepositoryPort,
} from '../ports/auth-event-repository.port';
import { USER_REPOSITORY_PORT, type IUserRepositoryPort } from '../ports/user-repository.port';
import { AuthService } from './auth.service';

const USER: User = {
  id: 'u-1',
  email: 'ana@ibm.com',
  fullName: 'Ana García',
  role: 'recruiter',
  timezone: 'America/Bogota',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};
const META = { ip: '10.0.0.1', userAgent: 'jest' };

describe('AuthService audit events', () => {
  const findByEmail = jest.fn();
  const record = jest.fn();
  let service: AuthService;

  beforeEach(async () => {
    findByEmail.mockReset();
    record.mockReset().mockResolvedValue(undefined);
    const users: IUserRepositoryPort = { findByEmail };
    const events: IAuthEventRepositoryPort = { record };
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: USER_REPOSITORY_PORT, useValue: users },
        { provide: AUTH_EVENT_REPOSITORY_PORT, useValue: events },
        { provide: JwtService, useValue: { sign: jest.fn().mockReturnValue('signed') } },
      ],
    }).compile();
    service = moduleRef.get(AuthService);
  });

  it('should record a login event with request meta when dev-login succeeds', async () => {
    findByEmail.mockResolvedValue(USER);

    await service.devLogin(USER.email, META);

    expect(record).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'u-1', type: 'login', ...META }),
    );
  });

  it('should not record any event when dev-login is rejected', async () => {
    findByEmail.mockResolvedValue(null);

    await expect(service.devLogin('x@ibm.com')).rejects.toThrow(UnauthorizedException);
    expect(record).not.toHaveBeenCalled();
  });

  it('should record a logout event with reason and meta when logout is called', async () => {
    await service.logout('u-1', 'idle', META);

    expect(record).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'u-1', type: 'logout', reason: 'idle', ...META }),
    );
  });
});
