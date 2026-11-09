import { Controller, HttpCode, HttpStatus, Post, UploadedFile, UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import type { IOpportunityDraftResponse } from '@ibm-talent-bridge/shared-types';
import { JwtAuthGuard } from '../../../../shared/auth/jwt-auth.guard';
import { Roles } from '../../../../shared/auth/roles.decorator';
import { RolesGuard } from '../../../../shared/auth/roles.guard';
import { NoBodyLog } from '../../../../shared/observability/no-body-log.decorator';
import { OpportunityDraftFileService } from '../../application/services/opportunity-draft-file.service';
import type { IOpportunityUploadedFile } from '../../domain/interfaces/opportunity-source.interface';
import { OPPORTUNITY_DRAFT_THROTTLE_LIMIT, OPPORTUNITY_DRAFT_THROTTLE_TTL_MS } from '../../domain/opportunity-draft/opportunity-draft.constants';
import { ApiAiController, ApiOpportunityDraftFile } from './ai.swagger';
import { toOpportunityDraftHttpError } from './opportunity-draft-http.mapper';
import { OpportunitySourceTooLargeFilter } from './opportunity-source-too-large.filter';

@ApiAiController()
@Controller('ai')
@UseGuards(JwtAuthGuard, RolesGuard)
// TODO(RBAC-1): reemplazar por permisos
@Roles('recruiter', 'pm')
export class OpportunityDraftFileController {
  constructor(private readonly service: OpportunityDraftFileService) {}

  /** Solo propone un borrador (R1) y descarta el archivo (R3). El frontend ramifica por `code`, nunca por el status. */
  @Post('opportunity-draft/file')
  @NoBodyLog()
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: OPPORTUNITY_DRAFT_THROTTLE_LIMIT, ttl: OPPORTUNITY_DRAFT_THROTTLE_TTL_MS } })
  @UseFilters(OpportunitySourceTooLargeFilter)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOpportunityDraftFile()
  async opportunityDraftFile(@UploadedFile() file: IOpportunityUploadedFile | undefined): Promise<IOpportunityDraftResponse> {
    try {
      return await this.service.draft(file);
    } catch (error) {
      throw toOpportunityDraftHttpError(error);
    }
  }
}
