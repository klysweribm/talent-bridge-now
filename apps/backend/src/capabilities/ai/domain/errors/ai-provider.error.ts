import type { TAiUnavailableReason } from '@ibm-talent-bridge/shared-types';

/**
 * Fallo del proveedor de IA ya clasificado. `kind` es la razón que ve el
 * llamador (mismo vocabulario que el contrato); `statusCode` es el HTTP de
 * ICA si lo hubo y decide si el fallo es reintentable. El mensaje nunca lleva
 * la clave ni el cuerpo de la respuesta.
 */
export class AiProviderError extends Error {
  constructor(
    message: string,
    readonly kind: TAiUnavailableReason,
    readonly statusCode?: number,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'AiProviderError';
  }
}
