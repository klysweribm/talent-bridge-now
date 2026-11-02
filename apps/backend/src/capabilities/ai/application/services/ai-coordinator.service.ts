import { Injectable, Logger } from '@nestjs/common';
import type { TAiAskResult } from '@ibm-talent-bridge/shared-types';
import { AiProviderError } from '../../domain/errors/ai-provider.error';
import type { TAiFileAskResult } from '../../domain/interfaces/ai-completion.interface';
import type { IAiAskInput, IAiDefinitionAskInput, IAiFileAskInput } from '../../domain/interfaces/ai-topic.interface';
import { AiCompletionService } from './ai-completion.service';
import { AiFileAskService } from './ai-file-ask.service';

/**
 * Punto de entrada para otras capabilities. NUNCA lanza: devuelve
 * `{ ok: true, ... }` o `{ ok: false, reason }` y cada llamador decide qué
 * hacer sin IA (disponibilidad falla suave, ADR-014).
 * TODO(AI-2): aquí se enrutará a sub-agentes registrados como herramientas.
 */
@Injectable()
export class AiCoordinatorService {
  private readonly logger = new Logger(AiCoordinatorService.name);

  constructor(
    private readonly completion: AiCompletionService,
    private readonly fileAsk: AiFileAskService,
  ) {}

  /** Consulta sobre un archivo (CV). Sube, pregunta y borra el archivo; nunca lanza. */
  askAboutFile(input: IAiFileAskInput): Promise<TAiFileAskResult> {
    return this.fileAsk.ask(input);
  }

  /** Consulta de texto con prompt y esquema propios del llamador (sin archivo). Nunca lanza ni loguea el prompt. */
  async askWithDefinition(input: IAiDefinitionAskInput): Promise<TAiFileAskResult> {
    try {
      return { ok: true, ...(await this.completion.completeWithDefinition(input)) };
    } catch (error) {
      if (error instanceof AiProviderError) {
        this.logger.warn(`AI definition ask failed: reason=${error.kind} status=${error.statusCode ?? '-'}`);
        return { ok: false, reason: error.kind };
      }
      this.logger.error(`AI definition ask failed unexpectedly: error=${error instanceof Error ? error.name : 'unknown'}`);
      return { ok: false, reason: 'UNREACHABLE' };
    }
  }

  async ask(input: IAiAskInput): Promise<TAiAskResult> {
    try {
      return { ok: true, ...(await this.completion.complete(input)) };
    } catch (error) {
      if (error instanceof AiProviderError) {
        // Solo razón y estado: nunca el prompt (puede llevar datos personales) ni la clave.
        this.logger.warn(`AI ask failed: topic=${input.topic} reason=${error.kind} status=${error.statusCode ?? '-'}`);
        return { ok: false, reason: error.kind };
      }
      this.logger.error(`AI ask failed unexpectedly: topic=${input.topic} error=${error instanceof Error ? error.name : 'unknown'}`);
      return { ok: false, reason: 'UNREACHABLE' };
    }
  }
}
