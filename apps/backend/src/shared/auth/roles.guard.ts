import { ForbiddenException, Injectable, type CanActivate, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { UserRole } from '@ibm-talent-bridge/shared-types';
import type { IJwtPayload } from './jwt-payload.interface';
import { ROLES_KEY } from './roles.decorator';

interface IAuthenticatedRequest {
  readonly user?: IJwtPayload;
}

/**
 * Exige que `request.user.role` (poblado por `JwtAuthGuard`) esté entre los
 * roles declarados con `@Roles(...)`. Sin metadata `@Roles` → permite
 * (la ruta solo exige sesión válida, no un rol concreto). Rol incorrecto
 * con sesión válida → 403 (401 es solo para "sin token válido").
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<IAuthenticatedRequest>();
    const userRole = request.user?.role;

    if (!userRole || !requiredRoles.includes(userRole)) {
      throw new ForbiddenException(`Requiere uno de estos roles: ${requiredRoles.join(', ')}`);
    }

    return true;
  }
}
