import type { ICvExtractionResult, TAiUnavailableReason, TCvExtractor } from '@ibm-talent-bridge/shared-types';
import type { ICvFile } from '../../domain/interfaces/cv-file.interface';

export type TCvExtractionOutcome =
  | { readonly ok: true; readonly result: ICvExtractionResult }
  | { readonly ok: false; readonly reason: TAiUnavailableReason };

/**
 * Puerto de extracción de CV. Un adapter por modo (`ica`, luego `classic`); todos devuelven el mismo esquema.
 * Nunca lanza por fallos del proveedor. Sin `@TraceFlow()`: recibe el CV (PII).
 */
export interface ICvExtractorPort {
  readonly mode: TCvExtractor;
  extract(file: ICvFile): Promise<TCvExtractionOutcome>;
}
