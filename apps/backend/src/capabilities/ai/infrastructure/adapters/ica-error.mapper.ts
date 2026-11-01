import { AiProviderError } from '../../domain/errors/ai-provider.error';

/**
 * Clasifica una respuesta de error de ICA. Los 400 se distinguen por el CUERPO:
 * una clave inválida da 400 `Invalid icaKey` (no 401). Los mensajes no repiten el cuerpo.
 */
export function classifyIcaError(status: number, body: string): AiProviderError {
  if (status === 401 || status === 403 || /Invalid icaKey/i.test(body)) {
    return new AiProviderError('ICA rejected the credentials', 'UNAUTHORIZED', status);
  }
  if (/Model not found/i.test(body) || /UnsupportedParamsError/i.test(body)) {
    return new AiProviderError('ICA model or request parameters rejected (configuration error)', 'MODEL_NOT_FOUND', status);
  }
  if (status === 429) return new AiProviderError('ICA rate limit exceeded', 'RATE_LIMITED', status);
  return new AiProviderError(`ICA responded with status ${status}`, 'UNREACHABLE', status);
}
