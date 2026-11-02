import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { IUserOption, PaginatedResponse } from '@ibm-talent-bridge/shared-types';
import { JwtAuthGuard } from '../../../../shared/auth/jwt-auth.guard';
import { Roles } from '../../../../shared/auth/roles.decorator';
import { RolesGuard } from '../../../../shared/auth/roles.guard';
import { UserDirectoryService } from '../../application/services/user-directory.service';
import { UsersQueryDto } from '../../domain/dto/users-query.dto';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
// TODO(RBAC-1): reemplazar por permisos
@Roles('recruiter', 'pm')
export class UsersController {
  constructor(private readonly directory: UserDirectoryService) {}

  @Get()
  @ApiOperation({ summary: 'Lista paginada de usuarios (id y nombre) por rol: pm o recruiter' })
  @ApiResponse({ status: 200, description: 'Página de opciones { id, fullName }' })
  @ApiResponse({ status: 400, description: 'role ausente o distinto de pm | recruiter' })
  @ApiResponse({ status: 401, description: 'Sin token' })
  @ApiResponse({ status: 403, description: 'Rol sin acceso' })
  list(@Query() query: UsersQueryDto): Promise<PaginatedResponse<IUserOption>> {
    return this.directory.listByRole(query.role, query.page, query.limit);
  }
}
