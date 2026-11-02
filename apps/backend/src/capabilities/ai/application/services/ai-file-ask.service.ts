import { Inject, Injectable, Logger } from '@nestjs/common';
import { AI_CONFIG } from '../../domain/constants/ai.constants';
import { AiProviderError } from '../../domain/errors/ai-provider.error';
import type { TAiConfig } from '../../domain/interfaces/ai-config.interface';
import type { TAiFileAskResult } from '../../domain/interfaces/ai-completion.interface';
import type { IAiFileAskInput } from '../../domain/interfaces/ai-topic.interface';
import { AI_PROVIDER_PORT, type IAiProviderPort } from '../ports/ai-provider.port';
import { AiCompletionService } from './ai-completion.service';

/**
 * Consulta sobre un archivo: sube, espera, pregunta y BORRA siempre el archivo (también si algo falla).
 * Nunca lanza. Sin `@TraceFlow()` ni logs de contenido: solo ids, longitudes y razones.
 */
@Injectable()
export class AiFileAskService {
  private readonly logger = new Logger(AiFileAskService.name);

  constructor(
    @Inject(AI_PROVIDER_PORT) private readonly provider: IAiProviderPort,
    @Inject(AI_CONFIG) private readonly config: TAiConfig,
    private readonly completion: AiCompletionService,
  ) {}

  async ask(input: IAiFileAskInput): Promise<TAiFileAskResult> {
    const config = this.config;
    if (!config.enabled) return { ok: false, reason: 'NOT_CONFIGURED' };
    const signal = AbortSignal.timeout(config.totalTimeoutMs);
    let fileId: string | undefined;
    try {
      fileId = await this.provider.uploadFile(input.file, signal);
      await this.provider.waitForFile(fileId, signal);
      const { first, answer } = await this.completion.run(config, input.definition, input.query, signal, [fileId]);
      return { ok: true, answer, source: config.provider, model: first.model };
    } catch (error) {
      return this.failure(error);
    } finally {
      if (fileId !== undefined) await this.discard(fileId);
    }
  }

  private failure(error: unknown): TAiFileAskResult {
    if (error instanceof AiProviderError) {
      this.logger.warn(`AI file ask failed: reason=${error.kind} status=${error.statusCode ?? '-'}`);
      return { ok: false, reason: error.kind };
    }
    this.logger.error(`AI file ask failed unexpectedly: error=${error instanceof Error ? error.name : 'unknown'}`);
    return { ok: false, reason: 'UNREACHABLE' };
  }

  private async discard(fileId: string): Promise<void> {
    try {
      await this.provider.deleteFile(fileId);
    } catch (error) {
      this.logger.warn(`AI file cleanup failed: fileId=${fileId} reason=${error instanceof AiProviderError ? error.kind : 'unknown'}`);
    }
  }
}
