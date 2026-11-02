import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

export const ApiCandidatesController = (): ClassDecorator =>
  applyDecorators(
    ApiTags('Candidates'),
    ApiBearerAuth(),
    ApiResponse({ status: 401, description: 'Sin token / token inválido' }),
    ApiResponse({ status: 403, description: 'Rol sin acceso (solo recruiter y pm)' }),
  ) as ClassDecorator;

export const ApiExtractCv = (): MethodDecorator =>
  applyDecorators(
    ApiOperation({ summary: 'Extrae un borrador de perfil desde un CV (PDF o DOCX). No persiste nada' }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        required: ['file', 'mode'],
        properties: { file: { type: 'string', format: 'binary' }, mode: { type: 'string', enum: ['ica', 'classic'] } },
      },
    }),
    ApiResponse({ status: 201, description: '{ extractor, draft, missingFields, warnings }' }),
    ApiResponse({ status: 400, description: 'Archivo ausente, vacío, de tipo no permitido (incluye .doc) o demasiado grande; mode inválido o no soportado' }),
    ApiResponse({ status: 429, description: 'Throttle excedido' }),
    ApiResponse({ status: 503, description: '{ reason }: ICA no disponible (nunca 401)' }),
  ) as MethodDecorator;

export const ApiCreateCandidate = (): MethodDecorator =>
  applyDecorators(
    ApiOperation({ summary: 'Crea un candidato externo con status tentative' }),
    ApiResponse({ status: 201, description: 'Candidato creado' }),
    ApiResponse({ status: 400, description: 'Datos inválidos, o email duplicado (el cuerpo trae `existing`)' }),
  ) as MethodDecorator;

export const ApiUpdateCandidate = (): MethodDecorator =>
  applyDecorators(
    ApiOperation({ summary: 'Reemplaza por completo los campos del perfil (UC-CAND-6). El autor sale del JWT' }),
    ApiResponse({ status: 200, description: 'Candidato actualizado (updatedBy, updateCount + 1)' }),
    ApiResponse({ status: 400, description: 'Datos inválidos, id mal formado o email distinto al guardado' }),
    ApiResponse({ status: 404, description: 'Candidato inexistente' }),
  ) as MethodDecorator;
