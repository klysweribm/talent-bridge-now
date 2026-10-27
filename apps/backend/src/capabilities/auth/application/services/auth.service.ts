import { Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { IJwtPayload } from '../../../../shared/auth/jwt-payload.interface';
import { TraceFlow } from '../../../../shared/observability/trace-flow.decorator';
import { USER_REPOSITORY_PORT, type IUserRepositoryPort } from '../ports/user-repository.port';
import {
  AUTH_EVENT_REPOSITORY_PORT,
  type IAuthEventRepositoryPort,
} from '../ports/auth-event-repository.port';
import type { IRequestMeta, TLogoutReason } from '../../domain/interfaces/auth-event.interface';
import type { IAuthToken } from '../../domain/interfaces/auth-token.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(USER_REPOSITORY_PORT) private readonly userRepository: IUserRepositoryPort,
    @Inject(AUTH_EVENT_REPOSITORY_PORT)
    private readonly authEventRepository: IAuthEventRepositoryPort,
    private readonly jwtService: JwtService,
  ) {}

  @TraceFlow()
  async devLogin(email: string, meta: IRequestMeta = {}): Promise<IAuthToken> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      this.logger.warn('dev-login rechazado: usuario no sembrado');
      throw new UnauthorizedException('Usuario no provisionado');
    }

    const payload: IJwtPayload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    await this.authEventRepository.record({
      userId: user.id,
      type: 'login',
      at: new Date(),
      ...meta,
    });
    this.logger.log(`dev-login emitido para userId=${user.id} role=${user.role}`);

    return { accessToken, user };
  }

  /** Registra el cierre de sesión en la auditoría. El JWT sigue válido hasta `exp` (DT-018). */
  @TraceFlow()
  async logout(userId: string, reason: TLogoutReason, meta: IRequestMeta = {}): Promise<void> {
    await this.authEventRepository.record({
      userId,
      type: 'logout',
      reason,
      at: new Date(),
      ...meta,
    });
    this.logger.log(`logout registrado userId=${userId} reason=${reason}`);
  }
}
