import { Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { IJwtPayload } from '../../../../shared/auth/jwt-payload.interface';
import { TraceFlow } from '../../../../shared/observability/trace-flow.decorator';
import { USER_REPOSITORY_PORT, type IUserRepositoryPort } from '../ports/user-repository.port';
import type { IAuthToken } from '../../domain/interfaces/auth-token.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(USER_REPOSITORY_PORT) private readonly userRepository: IUserRepositoryPort,
    private readonly jwtService: JwtService,
  ) {}

  @TraceFlow()
  async devLogin(email: string): Promise<IAuthToken> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      this.logger.warn('dev-login rechazado: usuario no sembrado');
      throw new UnauthorizedException('Usuario no provisionado');
    }

    const payload: IJwtPayload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    this.logger.log(`dev-login emitido para userId=${user.id} role=${user.role}`);

    return { accessToken, user };
  }
}
