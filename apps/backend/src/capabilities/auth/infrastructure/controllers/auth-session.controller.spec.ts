import { Test } from '@nestjs/testing';
import type { Request } from 'express';
import type { IJwtPayload } from '../../../../shared/auth/jwt-payload.interface';
import { AuthService } from '../../application/services/auth.service';
import { AuthSessionController } from './auth-session.controller';

describe('AuthSessionController', () => {
  it('should call AuthService.logout with the token subject, reason and request meta', async () => {
    const logout = jest.fn().mockResolvedValue(undefined);
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthSessionController],
      providers: [{ provide: AuthService, useValue: { logout } }],
    }).compile();
    const req = {
      ip: '10.0.0.1',
      get: () => 'jest-agent',
      user: { sub: 'u-1' } as IJwtPayload,
    } as unknown as Request & { readonly user: IJwtPayload };

    await moduleRef.get(AuthSessionController).logout({ reason: 'manual' }, req);

    expect(logout).toHaveBeenCalledWith('u-1', 'manual', {
      ip: '10.0.0.1',
      userAgent: 'jest-agent',
    });
  });
});
