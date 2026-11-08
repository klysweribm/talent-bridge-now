import type { Request } from 'express';
import { Body, Controller, Delete, HttpCode, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { ICandidateActor, IProcessDetail } from '@ibm-talent-bridge/shared-types';
import { JwtAuthGuard } from '../../../../shared/auth/jwt-auth.guard';
import type { IJwtPayload } from '../../../../shared/auth/jwt-payload.interface';
import { Roles } from '../../../../shared/auth/roles.decorator';
import { RolesGuard } from '../../../../shared/auth/roles.guard';
import { NoBodyLog } from '../../../../shared/observability/no-body-log.decorator';
import { ProcessCandidatesService } from '../../application/services/process-candidates.service';
import { AddProcessCandidateDto } from '../../domain/dto/add-process-candidate.dto';
import { ProcessCandidateParamDto } from '../../domain/dto/process-candidate-param.dto';
import { ProcessIdParamDto } from '../../domain/dto/process-id-param.dto';

type AuthedRequest = Request & { readonly user: IJwtPayload };

const toActor = (req: AuthedRequest): ICandidateActor => ({ id: req.user.sub, email: req.user.email, role: req.user.role });

@ApiTags('processes')
@ApiBearerAuth()
@NoBodyLog()
@Controller('processes/:id/candidates')
@UseGuards(JwtAuthGuard, RolesGuard)
// TODO(RBAC-1): reemplazar por permisos
@Roles('recruiter', 'pm')
export class ProcessCandidatesController {
  constructor(private readonly candidates: ProcessCandidatesService) {}

  @Post()
  @ApiOperation({ summary: 'Asocia un candidato disponible al proceso (solo PM dueño o reclutador del proceso)' })
  @ApiResponse({ status: 201, description: 'Detalle actualizado del proceso' })
  @ApiResponse({ status: 400, description: 'Id inválido o límite de candidatos superado' })
  @ApiResponse({ status: 403, description: 'No es el PM dueño ni el reclutador del proceso' })
  @ApiResponse({ status: 404, description: 'Proceso o candidato inexistente' })
  @ApiResponse({ status: 409, description: 'El candidato ya pertenece a un proceso' })
  @ApiResponse({ status: 503, description: 'Falló la segunda escritura; se revirtió' })
  add(@Param() params: ProcessIdParamDto, @Body() dto: AddProcessCandidateDto, @Req() req: AuthedRequest): Promise<IProcessDetail> {
    return this.candidates.associate(params.id, dto.candidateId, toActor(req));
  }

  @Delete(':candidateId')
  @HttpCode(200)
  @ApiOperation({ summary: 'Quita un candidato del proceso y lo libera' })
  @ApiResponse({ status: 200, description: 'Detalle actualizado del proceso' })
  @ApiResponse({ status: 403, description: 'No es el PM dueño ni el reclutador del proceso' })
  @ApiResponse({ status: 404, description: 'Proceso inexistente o el candidato no está en él' })
  remove(@Param() params: ProcessCandidateParamDto, @Req() req: AuthedRequest): Promise<IProcessDetail> {
    return this.candidates.dissociate(params.id, params.candidateId, toActor(req));
  }
}
