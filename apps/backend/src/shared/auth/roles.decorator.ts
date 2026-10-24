import { SetMetadata } from '@nestjs/common';
import type { UserRole } from '@ibm-talent-bridge/shared-types';

export const ROLES_KEY = 'roles';

/**
 * Marca un handler/controller con los roles permitidos. Leído por
 * `RolesGuard`; debe usarse junto a `JwtAuthGuard` (que resuelve
 * `request.user`), nunca solo.
 */
export const Roles = (...roles: readonly UserRole[]): MethodDecorator & ClassDecorator =>
  SetMetadata(ROLES_KEY, roles);
