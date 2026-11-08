import type { IDocumentFile } from './document-file.interface';

export const DOCUMENT_TEXT_EXTRACTOR_PORT = Symbol('DOCUMENT_TEXT_EXTRACTOR_PORT');

/**
 * Extrae el texto plano de un documento (PDF/DOCX) en local. Lanza `BadRequestException` si el archivo es ilegible.
 * Sin `@TraceFlow()`: puede recibir un CV (PII).
 */
export interface IDocumentTextExtractorPort {
  extractText(file: IDocumentFile): Promise<string>;
}
