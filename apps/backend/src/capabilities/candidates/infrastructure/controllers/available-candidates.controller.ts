import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { IProcessCandidateSummary, PaginatedResponse } from '@ibm-talent-bridge/shared-types';
import { JwtAuthGuard } from '../../../../shared/auth/jwt-auth.guard';
import { Roles } from '../../../../shared/auth/roles.decorator';
import { RolesGuard } from '../../../../shared/auth/roles.guard';
import { NoBodyLog } from '../../../../shared/observability/no-body-log.decorator';
import { PaginationQueryDto } from '../../../../shared/pagination/pagination-query.dto';
import { CandidateProcessLinkService } from '../../application/services/candidate-process-link.service';

/** Va en su propio controlador, registrado antes que `CandidatesController`, para que nunca compita con `:id`. */
@ApiTags('Candidates')
@ApiBearerAuth()
@NoBodyLog()
@Controller('candidates/available')
@UseGuards(JwtAuthGuard, RolesGuard)
// TODO(RBAC-1): reemplazar por permisos
@Roles('recruiter', 'pm')
export class AvailableCandidatesController {
  constructor(private readonly candidates: CandidateProcessLinkService) {}

  @Get()
  @ApiOperation({ summary: 'Candidatos sin proceso, paginados: solo id, nombre y rol principal' })
  @ApiResponse({ status: 200, description: 'Página de candidatos disponibles' })
  @ApiResponse({ status: 400, description: 'page o limit fuera de rango' })
  list(@Query() query: PaginationQueryDto): Promise<PaginatedResponse<IProcessCandidateSummary>> {
    return this.candidates.listAvailable(query.page, query.limit);
  }
}
