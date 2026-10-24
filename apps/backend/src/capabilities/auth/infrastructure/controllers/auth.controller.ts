import { Body, Controller, Get, NotFoundException, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../shared/auth/jwt-auth.guard';
import { Roles } from '../../../../shared/auth/roles.decorator';
import { RolesGuard } from '../../../../shared/auth/roles.guard';
import { AuthService } from '../../application/services/auth.service';
import { DevLoginDto } from '../../domain/dto/dev-login.dto';
import type { IAuthToken } from '../../domain/interfaces/auth-token.interface';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('dev-login')
  @ApiOperation({ summary: 'Login de desarrollo: email de usuario sembrado → JWT (AUTH-1)' })
  @ApiResponse({ status: 201, description: 'JWT emitido con el rol del usuario' })
  @ApiResponse({ status: 400, description: 'Email inválido o propiedades no permitidas' })
  @ApiResponse({ status: 401, description: 'Email sin usuario sembrado' })
  @ApiResponse({ status: 404, description: 'Deshabilitado cuando NODE_ENV=production' })
  async devLogin(@Body() dto: DevLoginDto): Promise<IAuthToken> {
    if (this.configService.get<string>('NODE_ENV') === 'production') {
      throw new NotFoundException();
    }

    return this.authService.devLogin(dto.email);
  }

  @Get('whoami')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('recruiter')
  @ApiOperation({
    summary: 'Endpoint de prueba para JwtAuthGuard/RolesGuard (solo rol recruiter)',
  })
  @ApiResponse({ status: 200, description: 'Token válido y rol recruiter' })
  @ApiResponse({ status: 401, description: 'Sin token / token inválido' })
  @ApiResponse({ status: 403, description: 'Token válido pero rol distinto de recruiter' })
  whoami(): { readonly ok: true } {
    return { ok: true };
  }
}
