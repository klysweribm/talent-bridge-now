import type { Logger } from '@nestjs/common';
import { AiProviderError } from '../../domain/errors/ai-provider.error';
import type { IAiRetryConfig } from '../../domain/interfaces/ai-config.interface';
import { classifyIcaError } from './ica-error.mapper';
import { parseLenientJson } from './ica-file.mapper';

export interface IIcaTarget {
  readonly apiUrl: string;
  readonly apiKey: string;
  readonly model: string;
  readonly callTimeoutMs: number;
  readonly retry: IAiRetryConfig;
}

/** Transporte HTTP hacia ICA: cabecera Bearer, tope por llamada + tope total, y lectura de cuerpos. La clave nunca se loguea. */
export class IcaTransport {
  constructor(private readonly logger: Logger) {}

  async send(target: IIcaTarget, method: 'GET' | 'POST' | 'DELETE', path: string, totalSignal?: AbortSignal, body?: unknown): Promise<Response> {
    const callSignal = AbortSignal.timeout(target.callTimeoutMs);
    const signal = totalSignal ? AbortSignal.any([callSignal, totalSignal]) : callSignal;
    if (signal.aborted) throw new AiProviderError('The AI call timed out', 'TIMEOUT');
    try {
      return await fetch(`${target.apiUrl}${path}`, {
        method,
        // Con FormData el Content-Type (con su boundary) lo fija fetch.
        headers: { ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }), Authorization: `Bearer ${target.apiKey}` },
        ...(body === undefined ? {} : { body: body instanceof FormData ? body : JSON.stringify(body) }),
        signal,
      });
    } catch (error) {
      // Nunca se propaga el error original: su mensaje podría incluir la URL o cabeceras.
      if (signal.aborted) throw new AiProviderError('The AI call timed out', 'TIMEOUT');
      this.logger.warn(`ICA network failure: ${error instanceof Error ? error.name : 'unknown'}`);
      throw new AiProviderError('ICA is unreachable', 'UNREACHABLE');
    }
  }

  async readLenient(response: Response): Promise<unknown> {
    if (!response.ok) throw classifyIcaError(response.status, await response.text().catch(() => ''));
    try {
      return parseLenientJson(await response.text());
    } catch {
      throw new AiProviderError('ICA returned a body that is not JSON', 'INVALID_OUTPUT', response.status);
    }
  }

  async readJson(response: Response): Promise<unknown> {
    if (!response.ok) throw classifyIcaError(response.status, await response.text().catch(() => ''));
    try {
      return (await response.json()) as unknown;
    } catch {
      throw new AiProviderError('ICA returned a body that is not JSON', 'INVALID_OUTPUT', response.status);
    }
  }
}
