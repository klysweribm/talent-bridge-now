import type { Request } from 'express';
import { Body, Controller, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { ICandidateActor, IProcessDetail } from '@ibm-talent-bridge/shared-types';
import { JwtAuthGuard } from '../../../../shared/auth/jwt-auth.guard';
import type { IJwtPayload } from '../../../../shared/auth/jwt-payload.interface';
import { Roles } from '../../../../shared/auth/roles.decorator';
import { RolesGuard } from '../../../../shared/auth/roles.guard';
import { ProcessUpdateService } from '../../application/services/process-update.service';
import { ProcessIdParamDto } from '../../domain/dto/process-id-param.dto';
import { UpdateProcessDto } from '../../domain/dto/update-process.dto';

type AuthedRequest = Request & { readonly user: IJwtPayload };

@ApiTags('processes')
@ApiBearerAuth()
@Controller('processes')
@UseGuards(JwtAuthGuard, RolesGuard)
// TODO(RBAC-1): reemplazar por permisos
@Roles('recruiter', 'pm')
export class ProcessUpdateController {
  constructor(private readonly updates: ProcessUpdateService) {}

  @Patch(':id')
  @ApiOperation({ summary: 'Edita, cambia el reclutador o el estado (PM dueño o reclutador asignado; el reclutador solo lo cambia el PM dueño)' })
  @ApiResponse({ status: 200, description: 'Detalle actualizado; al cancelar libera los candidatos' })
  @ApiResponse({ status: 400, description: 'Datos inválidos, recruiterId sin rol de reclutador o PROCESS_TERMINAL_STATE' })
  @ApiResponse({ status: 403, description: 'No es el PM dueño ni el reclutador asignado' })
  @ApiResponse({ status: 404, description: 'Proceso inexistente' })
  @ApiResponse({ status: 503, description: 'PROCESS_RELEASE_FAILED: no se pudieron liberar los candidatos' })
  update(@Param() params: ProcessIdParamDto, @Body() dto: UpdateProcessDto, @Req() req: AuthedRequest): Promise<IProcessDetail> {
    return this.updates.update(params.id, dto, { id: req.user.sub, email: req.user.email, role: req.user.role } satisfies ICandidateActor);
  }
}
