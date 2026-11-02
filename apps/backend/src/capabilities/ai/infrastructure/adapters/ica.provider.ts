import { Inject, Injectable, Logger } from '@nestjs/common';
import { AI_CONFIG } from '../../domain/constants/ai.constants';
import { AiProviderError } from '../../domain/errors/ai-provider.error';
import type { IAiCompletion, IAiCompletionRequest, IAiFileUpload } from '../../domain/interfaces/ai-completion.interface';
import type { TAiConfig } from '../../domain/interfaces/ai-config.interface';
import type { IAiProviderPort } from '../../application/ports/ai-provider.port';
import { TraceFlow } from '../../../../shared/observability/trace-flow.decorator';
import { classifyIcaError } from './ica-error.mapper';
import {
  buildIcaChatRequest, isUnsupportedResponseFormatError, mapIcaChatResponse, mapIcaModelsResponse,
} from './ica-chat-request.mapper';
import { mapIcaFileState, mapIcaFileUpload } from './ica-file.mapper';
import { IcaTransport, type IIcaTarget } from './ica-transport';
import { abortableDelay, buildAiRetryOptions } from './retry-config.util';
import { withRetry } from './with-retry.util';

/** Espera entre consultas de un archivo: crece 1,5x desde 1 s hasta un tope de 3 s. */
const FILE_POLL_BASE_MS = 1000;
const FILE_POLL_MAX_MS = 3000;

/** Adapter HTTP de IBM Consulting Advantage (`/chat-models`). La clave solo vive aquí y nunca se loguea. */
@Injectable()
export class IcaProvider implements IAiProviderPort {
  private readonly logger = new Logger(IcaProvider.name);
  private readonly http = new IcaTransport(this.logger);

  constructor(@Inject(AI_CONFIG) private readonly config: TAiConfig) {}

  // Los argumentos (mensajes) pueden llevar datos personales y la clave no es argumento: FlowLog solo ve la petición.
  @TraceFlow()
  async complete(request: IAiCompletionRequest): Promise<IAiCompletion> {
    const target = this.target();
    const model = request.model ?? target.model;
    const send = (jsonMode: boolean): Promise<Response> =>
      this.http.send(target, 'POST', '/chat-models/chat/completions', request.signal, buildIcaChatRequest(request, model, request.maxTokens, jsonMode));
    const attempt = async (): Promise<IAiCompletion> => {
      let response = await send(request.jsonMode === true);
      if (response.status === 400 && request.jsonMode === true) {
        const body = await response.text();
        if (!isUnsupportedResponseFormatError(body)) throw classifyIcaError(400, body);
        this.logger.warn('ICA rejected response_format; retrying once without JSON mode');
        response = await send(false);
      }
      return mapIcaChatResponse(await this.http.readJson(response), model);
    };
    return withRetry(attempt, buildAiRetryOptions(target.retry, this.logger, request.signal));
  }

  @TraceFlow()
  async listModels(): Promise<readonly string[]> {
    const target = this.target();
    return mapIcaModelsResponse(await this.http.readJson(await this.http.send(target, 'GET', '/chat-models/models')));
  }

  // Sin @TraceFlow(): el argumento es el CV (PII). Nunca se loguea su contenido.
  async uploadFile(file: IAiFileUpload, signal?: AbortSignal): Promise<string> {
    const target = this.target();
    const attempt = async (): Promise<string> => {
      const form = new FormData();
      // El tipo MIME se fija explícito: ICA no lo infiere de la extensión.
      form.append('file', new Blob([new Uint8Array(file.data)], { type: file.mimeType }), file.filename);
      return mapIcaFileUpload(await this.http.readJson(await this.http.send(target, 'POST', '/files', signal, form)));
    };
    return withRetry(attempt, buildAiRetryOptions(target.retry, this.logger, signal));
  }

  // Sin @TraceFlow(): devuelve el texto del CV (PII).
  async waitForFile(fileId: string, signal?: AbortSignal): Promise<string> {
    const target = this.target();
    for (let poll = 0; ; poll += 1) {
      const response = await this.http.send(target, 'GET', `/files/${encodeURIComponent(fileId)}`, signal);
      const state = mapIcaFileState(await this.http.readLenient(response));
      if (state.status === 'completed') return state.content;
      await abortableDelay(Math.min(FILE_POLL_BASE_MS * 1.5 ** poll, FILE_POLL_MAX_MS), signal);
    }
  }

  @TraceFlow()
  async deleteFile(fileId: string): Promise<void> {
    const response = await this.http.send(this.target(), 'DELETE', `/files/${encodeURIComponent(fileId)}`);
    if (!response.ok) throw classifyIcaError(response.status, await response.text().catch(() => ''));
  }

  private target(): IIcaTarget {
    if (!this.config.enabled || !this.config.ica) throw new AiProviderError('AI is not configured', 'NOT_CONFIGURED');
    const { ica, model, callTimeoutMs, retry } = this.config;
    return { apiUrl: ica.apiUrl, apiKey: ica.apiKey, model, callTimeoutMs, retry };
  }
}
