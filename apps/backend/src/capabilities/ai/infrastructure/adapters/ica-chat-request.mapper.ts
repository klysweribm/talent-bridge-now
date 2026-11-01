import { AiProviderError } from '../../domain/errors/ai-provider.error';
import type { IAiCompletion, IAiCompletionRequest } from '../../domain/interfaces/ai-completion.interface';

interface IIcaChatResponse {
  readonly model?: string;
  readonly choices?: readonly { readonly message?: { readonly content?: string | null }; readonly finish_reason?: string }[];
  readonly usage?: { readonly prompt_tokens?: number; readonly completion_tokens?: number };
}

/**
 * Cuerpo OpenAI-compatible. Los modelos de ICA solo aceptan temperature=1, así que
 * se OMITE (con 0 o 0.3 el gateway responde 400 UnsupportedParamsError). Sin stream ni files.
 */
export function buildIcaChatRequest(
  request: Pick<IAiCompletionRequest, 'messages'>,
  model: string,
  maxTokens: number,
  jsonMode: boolean,
): Record<string, unknown> {
  return {
    model,
    messages: request.messages,
    max_tokens: maxTokens,
    ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
  };
}

function invalid(message: string): AiProviderError {
  return new AiProviderError(message, 'INVALID_OUTPUT');
}

export function mapIcaChatResponse(json: unknown, requestedModel: string): IAiCompletion {
  const data = (typeof json === 'object' && json !== null ? json : {}) as IIcaChatResponse;
  const choice = data.choices?.[0];
  const content = choice?.message?.content;
  if (typeof content !== 'string') throw invalid('ICA response has no message content');
  const usage = data.usage;
  return {
    content,
    finishReason: choice?.finish_reason ?? 'unknown',
    model: data.model ?? requestedModel,
    ...(usage ? { usage: { promptTokens: usage.prompt_tokens ?? 0, completionTokens: usage.completion_tokens ?? 0 } } : {}),
  };
}

export function mapIcaModelsResponse(json: unknown): readonly string[] {
  const data = (typeof json === 'object' && json !== null ? json : {}) as { data?: unknown };
  if (!Array.isArray(data.data)) throw invalid('ICA models response has no data');
  return (data.data as readonly { id?: unknown }[]).flatMap((model) => (typeof model.id === 'string' ? [model.id] : []));
}

/** litellm rechaza un parámetro no soportado con este error en lugar de ignorarlo. */
export function isUnsupportedResponseFormatError(bodyText: string): boolean {
  return /UnsupportedParamsError/i.test(bodyText) && /response_format/i.test(bodyText);
}
