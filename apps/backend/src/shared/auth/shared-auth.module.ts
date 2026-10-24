import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';

const DEFAULT_JWT_EXPIRATION = '1h';

/**
 * Infraestructura de auth reutilizable por todas las capabilities:
 * `JwtModule` (para firmar tokens, p. ej. desde `capabilities/auth`) y la
 * estrategia Passport que `JwtAuthGuard` necesita para verificarlos.
 * `@Global()` para que ninguna otra capability tenga que reimportarla solo
 * para usar `JwtAuthGuard`/`RolesGuard`.
 */
@Global()
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION', DEFAULT_JWT_EXPIRATION),
        },
      }),
    }),
  ],
  providers: [JwtStrategy],
  exports: [JwtModule, PassportModule],
})
export class SharedAuthModule {}
