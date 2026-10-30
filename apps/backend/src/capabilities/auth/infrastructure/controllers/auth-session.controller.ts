import { Body, Controller, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import type { IJwtPayload } from '../../../../shared/auth/jwt-payload.interface';
import { JwtAuthGuard } from '../../../../shared/auth/jwt-auth.guard';
import { AuthService } from '../../application/services/auth.service';
import { LogoutDto } from '../../domain/dto/logout.dto';
import { requestMeta } from './request-meta';

@ApiTags('Auth')
@Controller('auth')
export class AuthSessionController {
  constructor(private readonly authService: AuthService) {}

  @Post('logout')
  @HttpCode(204)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Registra el cierre de sesión en auth_events (QW-2); cualquier rol' })
  @ApiResponse({ status: 204, description: 'Cierre de sesión registrado' })
  @ApiResponse({ status: 400, description: 'reason inválido' })
  @ApiResponse({ status: 401, description: 'Sin token / token inválido' })
  async logout(
    @Body() dto: LogoutDto,
    @Req() req: Request & { readonly user: IJwtPayload },
  ): Promise<void> {
    await this.authService.logout(req.user.sub, dto.reason, requestMeta(req));
  }
}
