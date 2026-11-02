import { BadRequestException, Injectable, Logger, Optional } from '@nestjs/common';
import JSZip = require('jszip');
import { PDFParse } from 'pdf-parse';
import { extractRawText } from 'mammoth';
import type { ICvTextExtractorPort } from '../../application/ports/cv-text-extractor.port';
import { CV_DOCX_MAX_UNCOMPRESSED_BYTES, CV_PARSE_TIMEOUT_MS, CV_PDF_MAX_PAGES, CV_PDF_MIME } from '../../domain/constants/cv.constants';
import type { ICvFile } from '../../domain/interfaces/cv-file.interface';

/** Texto local con `pdf-parse` / `mammoth`. Sin red; nunca loguea contenido, solo el nombre del error. */
@Injectable()
export class LocalCvTextExtractor implements ICvTextExtractorPort {
  private readonly logger = new Logger(LocalCvTextExtractor.name);

  private readonly timeoutMs: number;

  /** `@Optional()`: Nest no inyecta un `number`; en producción vale el valor por defecto y los tests pasan uno corto. */
  constructor(@Optional() timeoutMs?: number) {
    this.timeoutMs = timeoutMs ?? CV_PARSE_TIMEOUT_MS;
  }

  async extractText(file: ICvFile): Promise<string> {
    try {
      return await this.withTimeout(file.mimeType === CV_PDF_MIME ? this.pdfText(file) : this.docxText(file));
    } catch (error) {
      // El mensaje original podría citar contenido del archivo: solo se registra el nombre del error.
      this.logger.warn(`CV text extraction failed: error=${error instanceof Error ? error.name : 'unknown'}`);
      throw new BadRequestException('The file could not be read: it may be corrupt');
    }
  }

  /** El parser corre en el hilo de la petición: si tarda demasiado, se abandona (el resultado tardío se descarta). */
  private withTimeout<T>(work: Promise<T>): Promise<T> {
    let timer: NodeJS.Timeout | undefined;
    const expired = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error('CvParseTimeout')), this.timeoutMs);
    });
    return Promise.race([work, expired]).finally(() => clearTimeout(timer));
  }

  private async pdfText(file: ICvFile): Promise<string> {
    // pdf-parse toma la propiedad (transfiere) del TypedArray que recibe: se le pasa una copia para no dejar `file.data` inutilizable.
    const parser = new PDFParse({ data: file.data.slice() });
    try {
      return (await parser.getText({ first: CV_PDF_MAX_PAGES })).text;
    } finally {
      await parser.destroy();
    }
  }

  private async docxText(file: ICvFile): Promise<string> {
    await this.assertDocxSizeIsSane(file.data);
    return (await extractRawText({ buffer: Buffer.from(file.data) })).value;
  }

  /** Suma lo que descomprimiría cada entrada ANTES de que mammoth abra el archivo. */
  private async assertDocxSizeIsSane(data: Uint8Array): Promise<void> {
    const zip = await JSZip.loadAsync(data);
    let total = 0;
    for (const entry of Object.values(zip.files)) {
      // `_data.uncompressedSize` viene de la cabecera del zip y no obliga a descomprimir.
      total += (entry as unknown as { _data?: { uncompressedSize?: number } })._data?.uncompressedSize ?? 0;
      if (total > CV_DOCX_MAX_UNCOMPRESSED_BYTES) throw new Error('CvDocxTooLarge');
    }
  }
}
