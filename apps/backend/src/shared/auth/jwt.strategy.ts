import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { IJwtPayload } from './jwt-payload.interface';

/**
 * Passport strategy que verifica la firma/expiración del JWT (Bearer) y
 * expone el payload decodificado en `request.user`. Reutilizada por todas
 * las capabilities a través de `JwtAuthGuard`.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  validate(payload: IJwtPayload): IJwtPayload {
    return payload;
  }
}
