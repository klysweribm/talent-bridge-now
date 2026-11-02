import type { ICvFile } from '../../domain/interfaces/cv-file.interface';

export const CV_TEXT_EXTRACTOR_PORT = Symbol('CV_TEXT_EXTRACTOR_PORT');

/**
 * Extrae el texto plano de un CV (PDF/DOCX) en local. Lanza `BadRequestException` si el archivo es ilegible.
 * Sin `@TraceFlow()`: recibe el CV (PII).
 */
export interface ICvTextExtractorPort {
  extractText(file: ICvFile): Promise<string>;
}
