import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import type { IBenchResource, PaginatedResponse } from '@ibm-talent-bridge/shared-types';
import { JwtAuthGuard } from '../../../../shared/auth/jwt-auth.guard';
import { Roles } from '../../../../shared/auth/roles.decorator';
import { RolesGuard } from '../../../../shared/auth/roles.guard';
import { BenchService } from '../../application/services/bench.service';
import { BenchQueryDto } from '../../domain/dto/bench-query.dto';
import {
  ApiBenchController, ApiGetBenchResource, ApiListBench, ApiListBenchSkills,
} from './bench.swagger';

@ApiBenchController()
@Controller('bench')
@UseGuards(JwtAuthGuard, RolesGuard)
// TODO(RBAC-1): reemplazar por permisos
@Roles('recruiter', 'pm')
export class BenchController {
  constructor(private readonly benchService: BenchService) {}

  @Get()
  @ApiListBench()
  list(@Query() query: BenchQueryDto): Promise<PaginatedResponse<IBenchResource>> {
    return this.benchService.list(query);
  }

  // Debe ir ANTES de ':benchCode', o 'skills' se captura como código.
  @Get('skills')
  @ApiListBenchSkills()
  skills(): Promise<readonly string[]> {
    return this.benchService.listSkills();
  }

  @Get(':benchCode')
  @ApiGetBenchResource()
  detail(@Param('benchCode') benchCode: string): Promise<IBenchResource> {
    return this.benchService.getByCode(benchCode);
  }
}
