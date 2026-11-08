import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { IAiAskSuccess, IAiStatus, IOpportunityDraftResponse } from '@ibm-talent-bridge/shared-types';
import { JwtAuthGuard } from '../../../../shared/auth/jwt-auth.guard';
import { Roles } from '../../../../shared/auth/roles.decorator';
import { RolesGuard } from '../../../../shared/auth/roles.guard';
import { AiCoordinatorService } from '../../application/services/ai-coordinator.service';
import { AiStatusService } from '../../application/services/ai-status.service';
import { OpportunityDraftService } from '../../application/services/opportunity-draft.service';
import { AI_ASK_THROTTLE_LIMIT, AI_ASK_THROTTLE_TTL_MS } from '../../domain/constants/ai.constants';
import { AskAiDto } from '../../domain/dto/ask-ai.dto';
import { OpportunityDraftDto } from '../../domain/dto/opportunity-draft.dto';
import { OPPORTUNITY_DRAFT_THROTTLE_LIMIT, OPPORTUNITY_DRAFT_THROTTLE_TTL_MS } from '../../domain/opportunity-draft/opportunity-draft.constants';
import { toOpportunityDraftHttpError } from './opportunity-draft-http.mapper';
import { ApiAiAsk, ApiAiController, ApiAiStatus, ApiOpportunityDraft } from './ai.swagger';

@ApiAiController()
@Controller('ai')
@UseGuards(JwtAuthGuard, RolesGuard)
// TODO(RBAC-1): reemplazar por permisos
@Roles('recruiter', 'pm')
export class AiController {
  constructor(
    private readonly coordinator: AiCoordinatorService,
    private readonly statusService: AiStatusService,
    private readonly opportunityDraftService: OpportunityDraftService,
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

  /** Solo propone un borrador (R1): no crea nada. El frontend ramifica por `code`, nunca por el status. */
  @Post('opportunity-draft')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: OPPORTUNITY_DRAFT_THROTTLE_LIMIT, ttl: OPPORTUNITY_DRAFT_THROTTLE_TTL_MS } })
  @ApiOpportunityDraft()
  async opportunityDraft(@Body() dto: OpportunityDraftDto): Promise<IOpportunityDraftResponse> {
    try {
      return await this.opportunityDraftService.draft(dto.text);
    } catch (error) {
      throw toOpportunityDraftHttpError(error);
    }
  }
}
