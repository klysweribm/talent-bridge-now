import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { ICandidateListItem, PaginatedResponse } from '@ibm-talent-bridge/shared-types';
import { JwtAuthGuard } from '../../../../shared/auth/jwt-auth.guard';
import { Roles } from '../../../../shared/auth/roles.decorator';
import { RolesGuard } from '../../../../shared/auth/roles.guard';
import { NoBodyLog } from '../../../../shared/observability/no-body-log.decorator';
import { CandidateListService } from '../../application/services/candidate-list.service';
import { CandidatesQueryDto } from '../../domain/dto/candidates-query.dto';

/** `GET /candidates` (raíz del recurso). Se registra antes que `CandidatesController`; no compite con `:id`. */
@ApiTags('Candidates')
@ApiBearerAuth()
@NoBodyLog()
@Controller('candidates')
@UseGuards(JwtAuthGuard, RolesGuard)
// TODO(RBAC-1): reemplazar por permisos
@Roles('recruiter', 'pm')
export class CandidatesListController {
  constructor(private readonly candidates: CandidateListService) {}

  @Get()
  @ApiOperation({ summary: 'Candidatos paginados (id, nombre, correo, rol principal, proceso), filtrables por assignment' })
  @ApiResponse({ status: 200, description: 'Página de candidatos, sin teléfono ni datos del CV' })
  @ApiResponse({ status: 400, description: 'page, limit o assignment inválidos' })
  list(@Query() query: CandidatesQueryDto): Promise<PaginatedResponse<ICandidateListItem>> {
    return this.candidates.list(query.page, query.limit, query.assignment);
  }
}
