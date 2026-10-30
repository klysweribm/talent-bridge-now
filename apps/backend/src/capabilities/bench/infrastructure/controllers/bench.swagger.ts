import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

const query = (name: string, description: string): MethodDecorator =>
  ApiQuery({ name, required: false, description });

export const ApiBenchController = (): ClassDecorator =>
  applyDecorators(
    ApiTags('Bench'),
    ApiBearerAuth(),
    ApiResponse({ status: 401, description: 'Sin token / token inválido' }),
    ApiResponse({ status: 403, description: 'Rol sin acceso (solo recruiter y pm)' }),
  ) as ClassDecorator;

export const ApiListBench = (): MethodDecorator =>
  applyDecorators(
    ApiOperation({ summary: 'Lista paginada del bench (por defecto available + soft_booked)' }),
    query('skills', 'Skills requeridas (todas), separadas por coma o param repetido; sin distinguir mayúsculas'),
    query('seniority', 'jr | ssr | sr | lead (coma o repetido)'),
    query('availableBy', 'Fecha ISO 8601: disponibles a más tardar ese día (inclusive)'),
    query('country', 'País exacto'),
    query('status', 'available | soft_booked | assigned (coma o repetido)'),
    query('page', 'Página, entero >= 1 (default 1)'),
    query('limit', 'Tamaño de página, 1..50 (default 20)'),
    ApiResponse({ status: 200, description: 'Página de recursos del bench' }),
    ApiResponse({ status: 400, description: 'Parámetros de consulta inválidos' }),
  ) as MethodDecorator;

export const ApiListBenchSkills = (): MethodDecorator =>
  applyDecorators(
    ApiOperation({ summary: 'Catálogo de skills del bench, distintas y ordenadas alfabéticamente' }),
    ApiResponse({ status: 200, description: 'Lista de nombres de skill' }),
  ) as MethodDecorator;

export const ApiGetBenchResource = (): MethodDecorator =>
  applyDecorators(
    ApiOperation({ summary: 'Detalle de un recurso del bench por benchCode' }),
    ApiResponse({ status: 200, description: 'Recurso del bench' }),
    ApiResponse({ status: 404, description: 'benchCode desconocido' }),
  ) as MethodDecorator;
