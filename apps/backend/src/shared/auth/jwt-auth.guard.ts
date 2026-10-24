import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard genérico para rutas protegidas: exige un Bearer JWT válido
 * (delegado a `JwtStrategy`). Sin token / token inválido → 401.
 * Usar junto a `RolesGuard` + `@Roles(...)` cuando además se exige un rol.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
