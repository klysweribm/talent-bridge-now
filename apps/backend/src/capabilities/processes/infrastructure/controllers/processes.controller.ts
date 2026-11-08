import type { Request } from 'express';
import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import type {
  ICandidateActor, IProcess, IProcessDetail, IProcessLimits, IProcessListItem, PaginatedResponse,
} from '@ibm-talent-bridge/shared-types';
import { JwtAuthGuard } from '../../../../shared/auth/jwt-auth.guard';
import type { IJwtPayload } from '../../../../shared/auth/jwt-payload.interface';
import { Roles } from '../../../../shared/auth/roles.decorator';
import { RolesGuard } from '../../../../shared/auth/roles.guard';
import { NoBodyLog } from '../../../../shared/observability/no-body-log.decorator';
import { ProcessLimitsService } from '../../application/services/process-limits.service';
import { ProcessService } from '../../application/services/process.service';
import { PROCESS_SEARCH_MAX } from '../../domain/constants/process.constants';
import { CreateProcessDto } from '../../domain/dto/create-process.dto';
import { ProcessIdParamDto } from '../../domain/dto/process-id-param.dto';
import { ProcessListQueryDto } from '../../domain/dto/process-list-query.dto';

type AuthedRequest = Request & { readonly user: IJwtPayload };

/** El autor sale siempre de la sesión (JWT), nunca del cuerpo. */
const toActor = (req: AuthedRequest): ICandidateActor => ({ id: req.user.sub, email: req.user.email, role: req.user.role });

@ApiTags('processes')
@ApiBearerAuth()
@Controller('processes')
@UseGuards(JwtAuthGuard, RolesGuard)
// TODO(RBAC-1): reemplazar por permisos
@Roles('recruiter', 'pm')
export class ProcessesController {
  constructor(private readonly processes: ProcessService, private readonly limitsService: ProcessLimitsService) {}

  @Post()
  @ApiOperation({ summary: 'Crea un proceso; el dueño PM y el reclutador dependen de quién lo crea' })
  @ApiResponse({ status: 201, description: 'Proceso creado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos, ownerPmId/recruiterId con rol incorrecto, candidateIds duplicados o sobre el límite' })
  create(@Body() dto: CreateProcessDto, @Req() req: AuthedRequest): Promise<IProcess> {
    return this.processes.create(dto, toActor(req));
  }

  @Get()
  @ApiOperation({ summary: 'Lista paginada de procesos, con los referentes asignados y búsqueda opcional' })
  @ApiQuery({ name: 'q', required: false, description: `Busca (parcial, sin distinguir mayúsculas) en título, cliente y rol de la oportunidad; máx. ${PROCESS_SEARCH_MAX} caracteres. Vacío = sin filtro` })
  @ApiResponse({ status: 400, description: 'page/limit/q inválidos (q repetido o de más de 100 caracteres)' })
  list(@Query() query: ProcessListQueryDto): Promise<PaginatedResponse<IProcessListItem>> {
    return this.processes.list(query.page, query.limit, query.q);
  }

  // Debe ir antes de `:id`, o esa ruta la captura.
  @Get('limits')
  @ApiOperation({ summary: 'Límites de procesos: tope de candidatos, oportunidad, referentes técnicos y estados terminales' })
  @ApiResponse({ status: 200, description: '{ maxCandidates, opportunity: { roleMax, descriptionMax, skillsMin, skillsMax, skillMax, bandMin, bandMax }, technicalRefsMax, terminalStatuses }' })
  limits(): IProcessLimits {
    return this.limitsService.getLimits();
  }

  @Get(':id')
  @NoBodyLog()
  @ApiOperation({ summary: 'Detalle de un proceso' })
  @ApiResponse({ status: 404, description: 'Proceso inexistente' })
  detail(@Param() params: ProcessIdParamDto): Promise<IProcessDetail> {
    return this.processes.getById(params.id);
  }
}
