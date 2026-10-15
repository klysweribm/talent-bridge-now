import { Controller, Get, Inject, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DB_STATUS_PORT, type IDbStatusPort } from './application/ports/db-status.port';
import type { IHealthStatus } from './domain/interfaces/health-status.interface';

const SERVICE_NAME = 'ibm-talent-bridge-api';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(@Inject(DB_STATUS_PORT) private readonly dbStatusPort: IDbStatusPort) {}

  @Get()
  @ApiOperation({ summary: 'Health check del servidor y la base de datos' })
  @ApiResponse({ status: 200, description: 'Servicio y base de datos operativos' })
  @ApiResponse({ status: 503, description: 'Base de datos no disponible' })
  check(): IHealthStatus {
    const isDbUp = this.dbStatusPort.isUp();
    const health: IHealthStatus = {
      status: isDbUp ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      service: SERVICE_NAME,
      database: isDbUp ? 'up' : 'down',
    };

    if (!isDbUp) {
      throw new ServiceUnavailableException(health);
    }

    return health;
  }
}
