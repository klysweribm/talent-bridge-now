import { Inject, Injectable, Logger } from '@nestjs/common';
import { AI_CONFIG } from '../../domain/constants/ai.constants';
import { AiProviderError } from '../../domain/errors/ai-provider.error';
import type { IAiCompletion, IAiCompletionRequest } from '../../domain/interfaces/ai-completion.interface';
import type { IAiRetryConfig, TAiConfig } from '../../domain/interfaces/ai-config.interface';
import type { IAiProviderPort } from '../../application/ports/ai-provider.port';
import { TraceFlow } from '../../../../shared/observability/trace-flow.decorator';
import { classifyIcaError } from './ica-error.mapper';
import {
  buildIcaChatRequest, isUnsupportedResponseFormatError, mapIcaChatResponse, mapIcaModelsResponse,
} from './ica-chat-request.mapper';
import { buildAiRetryOptions } from './retry-config.util';
import { withRetry } from './with-retry.util';

interface IIcaTarget {
  readonly apiUrl: string;
  readonly apiKey: string;
  readonly model: string;
  readonly callTimeoutMs: number;
  readonly retry: IAiRetryConfig;
}

/** Adapter HTTP de IBM Consulting Advantage (`/chat-models`). La clave solo vive aquí y nunca se loguea. */
@Injectable()
export class IcaProvider implements IAiProviderPort {
  private readonly logger = new Logger(IcaProvider.name);

  constructor(@Inject(AI_CONFIG) private readonly config: TAiConfig) {}

  // Los argumentos (mensajes) pueden llevar datos personales y la clave no es argumento: FlowLog solo ve la petición.
  @TraceFlow()
  async complete(request: IAiCompletionRequest): Promise<IAiCompletion> {
    const target = this.target();
    const model = request.model ?? target.model;
    const send = (jsonMode: boolean): Promise<Response> =>
      this.send(target, 'POST', '/chat-models/chat/completions', request.signal, buildIcaChatRequest(request, model, request.maxTokens, jsonMode));
    const attempt = async (): Promise<IAiCompletion> => {
      let response = await send(request.jsonMode === true);
      if (response.status === 400 && request.jsonMode === true) {
        const body = await response.text();
        if (!isUnsupportedResponseFormatError(body)) throw classifyIcaError(400, body);
        this.logger.warn('ICA rejected response_format; retrying once without JSON mode');
        response = await send(false);
      }
      return mapIcaChatResponse(await this.readJson(response), model);
    };
    return withRetry(attempt, buildAiRetryOptions(target.retry, this.logger, request.signal));
  }

  @TraceFlow()
  async listModels(): Promise<readonly string[]> {
    const target = this.target();
    return mapIcaModelsResponse(await this.readJson(await this.send(target, 'GET', '/chat-models/models')));
  }

  private target(): IIcaTarget {
    if (!this.config.enabled || !this.config.ica) throw new AiProviderError('AI is not configured', 'NOT_CONFIGURED');
    const { ica, model, callTimeoutMs, retry } = this.config;
    return { apiUrl: ica.apiUrl, apiKey: ica.apiKey, model, callTimeoutMs, retry };
  }

  private async send(target: IIcaTarget, method: 'GET' | 'POST', path: string, totalSignal?: AbortSignal, body?: unknown): Promise<Response> {
    const callSignal = AbortSignal.timeout(target.callTimeoutMs);
    const signal = totalSignal ? AbortSignal.any([callSignal, totalSignal]) : callSignal;
    if (signal.aborted) throw new AiProviderError('The AI call timed out', 'TIMEOUT');
    try {
      return await fetch(`${target.apiUrl}${path}`, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${target.apiKey}` },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        signal,
      });
    } catch (error) {
      // Nunca se propaga el error original: su mensaje podría incluir la URL o cabeceras.
      if (signal.aborted) throw new AiProviderError('The AI call timed out', 'TIMEOUT');
      this.logger.warn(`ICA network failure: ${error instanceof Error ? error.name : 'unknown'}`);
      throw new AiProviderError('ICA is unreachable', 'UNREACHABLE');
    }
  }

  private async readJson(response: Response): Promise<unknown> {
    if (!response.ok) throw classifyIcaError(response.status, await response.text().catch(() => ''));
    try {
      return (await response.json()) as unknown;
    } catch {
      throw new AiProviderError('ICA returned a body that is not JSON', 'INVALID_OUTPUT', response.status);
    }
  }
}
