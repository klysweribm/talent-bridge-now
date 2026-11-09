import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

export const ApiAiController = (): ClassDecorator =>
  applyDecorators(
    ApiTags('AI'),
    ApiBearerAuth(),
    ApiResponse({ status: 401, description: 'Sin token / token inválido' }),
    ApiResponse({ status: 403, description: 'Rol sin acceso (solo recruiter y pm)' }),
  ) as ClassDecorator;

export const ApiAiStatus = (): MethodDecorator =>
  applyDecorators(
    ApiOperation({ summary: 'Estado del asistente de IA (nunca incluye la clave)' }),
    ApiResponse({ status: 200, description: '{ available, source, model, reason? }' }),
  ) as MethodDecorator;

export const ApiAiAsk = (): MethodDecorator =>
  applyDecorators(
    ApiOperation({ summary: 'Consulta al asistente de IA por tópico' }),
    ApiResponse({ status: 200, description: '{ ok: true, answer, topic, source, model, usage }' }),
    ApiResponse({ status: 400, description: 'topic fuera de la lista, query vacía o demasiado larga' }),
    ApiResponse({ status: 429, description: 'Throttle excedido' }),
    ApiResponse({ status: 503, description: '{ ok: false, reason }: la IA no está disponible (nunca 401)' }),
  ) as MethodDecorator;

export const ApiOpportunityDraft = (): MethodDecorator =>
  applyDecorators(
    ApiOperation({ summary: 'Borrador de oportunidad a partir de texto libre (no crea nada)' }),
    ApiResponse({ status: 200, description: '{ draft, missingFields, warnings }: lo no inferido queda vacío' }),
    ApiResponse({ status: 400, description: 'Texto vacío (validación) u OPPORTUNITY_TEXT_TOO_LONG: { code, message }' }),
    ApiResponse({ status: 429, description: 'Throttle excedido' }),
    ApiResponse({ status: 503, description: 'AI_UNAVAILABLE: { code, message } (nunca 401)' }),
    ApiResponse({ status: 504, description: 'AI_TIMEOUT: { code, message }' }),
  ) as MethodDecorator;

export const ApiOpportunityDraftFile = (): MethodDecorator =>
  applyDecorators(
    ApiOperation({ summary: 'Borrador de oportunidad a partir de un brochure PDF/DOCX/MD/TXT (no crea ni guarda nada)' }),
    ApiConsumes('multipart/form-data'),
    ApiResponse({ status: 200, description: '{ draft, missingFields, warnings }: igual que con texto libre' }),
    ApiResponse({ status: 400, description: 'Archivo ausente, vacío, de tipo no admitido o demasiado grande; u OPPORTUNITY_TEXT_TOO_LONG' }),
    ApiResponse({ status: 422, description: 'OPPORTUNITY_SOURCE_UNREADABLE: { code, message }' }),
    ApiResponse({ status: 429, description: 'Throttle excedido' }),
    ApiResponse({ status: 503, description: 'AI_UNAVAILABLE: { code, message } (nunca 401)' }),
    ApiResponse({ status: 504, description: 'AI_TIMEOUT: { code, message }' }),
  ) as MethodDecorator;
