import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { IAiAskSuccess, IAiStatus } from '@ibm-talent-bridge/shared-types';
import { JwtAuthGuard } from '../../../../shared/auth/jwt-auth.guard';
import { Roles } from '../../../../shared/auth/roles.decorator';
import { RolesGuard } from '../../../../shared/auth/roles.guard';
import { AiCoordinatorService } from '../../application/services/ai-coordinator.service';
import { AiStatusService } from '../../application/services/ai-status.service';
import { AI_ASK_THROTTLE_LIMIT, AI_ASK_THROTTLE_TTL_MS } from '../../domain/constants/ai.constants';
import { AskAiDto } from '../../domain/dto/ask-ai.dto';
import { ApiAiAsk, ApiAiController, ApiAiStatus } from './ai.swagger';

@ApiAiController()
@Controller('ai')
@UseGuards(JwtAuthGuard, RolesGuard)
// TODO(RBAC-1): reemplazar por permisos
@Roles('recruiter', 'pm')
export class AiController {
  constructor(
    private readonly coordinator: AiCoordinatorService,
    private readonly statusService: AiStatusService,
  ) {}

  @Get('status')
  @ApiAiStatus()
  status(): Promise<IAiStatus> {
    return this.statusService.getStatus();
  }

  @Post('ask')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: AI_ASK_THROTTLE_LIMIT, ttl: AI_ASK_THROTTLE_TTL_MS } })
  @ApiAiAsk()
  async ask(@Body() dto: AskAiDto): Promise<IAiAskSuccess> {
    const result = await this.coordinator.ask({ topic: dto.topic, query: dto.query });
    // 503 (nunca 401: el httpClient del frontend cierra la sesión ante un 401).
    if (!result.ok) throw new HttpException(result, HttpStatus.SERVICE_UNAVAILABLE);
    return result;
  }
}
