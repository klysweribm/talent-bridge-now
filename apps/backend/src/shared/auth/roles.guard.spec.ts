import { ForbiddenException, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

function buildContext(user?: { role: string }): ExecutionContext {
  return {
    getHandler: () => jest.fn(),
    getClass: () => jest.fn(),
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  let reflector: Reflector;
  let guard: RolesGuard;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('should allow the request when no @Roles metadata is declared', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

    expect(guard.canActivate(buildContext({ role: 'pm' }))).toBe(true);
  });

  it('should allow the request when the user role is in the required roles', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['recruiter']);

    expect(guard.canActivate(buildContext({ role: 'recruiter' }))).toBe(true);
  });

  it('should throw ForbiddenException when the user role is not in the required roles', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['recruiter']);

    expect(() => guard.canActivate(buildContext({ role: 'pm' }))).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException when there is no authenticated user on the request', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['recruiter']);

    expect(() => guard.canActivate(buildContext(undefined))).toThrow(ForbiddenException);
  });
});
