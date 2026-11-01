import { Inject, Injectable, Logger } from '@nestjs/common';
import type { IAiStatus } from '@ibm-talent-bridge/shared-types';
import { AI_CONFIG } from '../../domain/constants/ai.constants';
import { AiProviderError } from '../../domain/errors/ai-provider.error';
import type { TAiConfig } from '../../domain/interfaces/ai-config.interface';
import { AI_PROVIDER_PORT, type IAiProviderPort } from '../ports/ai-provider.port';

/** Estado del asistente, independiente del resto de la app. Nunca incluye la clave. */
@Injectable()
export class AiStatusService {
  private readonly logger = new Logger(AiStatusService.name);

  constructor(
    @Inject(AI_PROVIDER_PORT) private readonly provider: IAiProviderPort,
    @Inject(AI_CONFIG) private readonly config: TAiConfig,
  ) {}

  async getStatus(): Promise<IAiStatus> {
    const config = this.config;
    if (!config.enabled) return { available: false, source: null, model: null, reason: 'NOT_CONFIGURED' };
    const base = { source: config.provider, model: config.model } as const;
    try {
      const models = await this.provider.listModels();
      return models.includes(config.model)
        ? { available: true, ...base }
        : { available: false, ...base, reason: 'MODEL_NOT_FOUND' };
    } catch (error) {
      const reason = error instanceof AiProviderError ? error.kind : 'UNREACHABLE';
      this.logger.warn(`AI status check failed: reason=${reason}`);
      return { available: false, ...base, reason };
    }
  }
}
