import type { IAiCompletion, IAiCompletionRequest, IAiFileUpload } from '../../domain/interfaces/ai-completion.interface';

/**
 * Puerto de salida hacia el proveedor de IA. Los servicios dependen solo de
 * esta abstracción; el adapter ICA (o el `fake`) vive en `infrastructure/adapters/`.
 * Lanza `AiProviderError` ya clasificado.
 */
export interface IAiProviderPort {
  complete(request: IAiCompletionRequest): Promise<IAiCompletion>;
  /** Ids de los modelos disponibles; sirve para `GET /ai/status`. */
  listModels(): Promise<readonly string[]>;
  /** Sube un archivo en memoria y devuelve su id en el proveedor. */
  uploadFile(file: IAiFileUpload, signal?: AbortSignal): Promise<string>;
  /** Espera (polling) a que el proveedor termine de procesar el archivo y devuelve su texto. Respeta `signal`. */
  waitForFile(fileId: string, signal?: AbortSignal): Promise<string>;
  deleteFile(fileId: string): Promise<void>;
}

export const AI_PROVIDER_PORT = Symbol('AI_PROVIDER_PORT');
