import type { IAiCompletion, IAiCompletionRequest } from '../../domain/interfaces/ai-completion.interface';

/**
 * Puerto de salida hacia el proveedor de IA. Los servicios dependen solo de
 * esta abstracción; el adapter ICA (o el `fake`) vive en `infrastructure/adapters/`.
 * Lanza `AiProviderError` ya clasificado.
 */
export interface IAiProviderPort {
  complete(request: IAiCompletionRequest): Promise<IAiCompletion>;
  /** Ids de los modelos disponibles; sirve para `GET /ai/status`. */
  listModels(): Promise<readonly string[]>;
}

export const AI_PROVIDER_PORT = Symbol('AI_PROVIDER_PORT');
