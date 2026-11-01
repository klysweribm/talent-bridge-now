import { Injectable, Logger } from '@nestjs/common';
import type { TAiAskResult } from '@ibm-talent-bridge/shared-types';
import { AiProviderError } from '../../domain/errors/ai-provider.error';
import type { IAiAskInput } from '../../domain/interfaces/ai-topic.interface';
import { AiCompletionService } from './ai-completion.service';

/**
 * Punto de entrada para otras capabilities. NUNCA lanza: devuelve
 * `{ ok: true, ... }` o `{ ok: false, reason }` y cada llamador decide qué
 * hacer sin IA (disponibilidad falla suave, ADR-014).
 * TODO(AI-2): aquí se enrutará a sub-agentes registrados como herramientas.
 */
@Injectable()
export class AiCoordinatorService {
  private readonly logger = new Logger(AiCoordinatorService.name);

  constructor(private readonly completion: AiCompletionService) {}

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
