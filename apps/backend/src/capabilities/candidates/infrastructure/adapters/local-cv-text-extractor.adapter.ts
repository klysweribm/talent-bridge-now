import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PDFParse } from 'pdf-parse';
import { extractRawText } from 'mammoth';
import type { ICvTextExtractorPort } from '../../application/ports/cv-text-extractor.port';
import { CV_PDF_MIME } from '../../domain/constants/cv.constants';
import type { ICvFile } from '../../domain/interfaces/cv-file.interface';

/** Texto local con `pdf-parse` / `mammoth`. Sin red; nunca loguea contenido, solo el nombre del error. */
@Injectable()
export class LocalCvTextExtractor implements ICvTextExtractorPort {
  private readonly logger = new Logger(LocalCvTextExtractor.name);

  async extractText(file: ICvFile): Promise<string> {
    try {
      return file.mimeType === CV_PDF_MIME ? await this.pdfText(file) : await this.docxText(file);
    } catch (error) {
      // El mensaje original podría citar contenido del archivo: solo se registra el nombre del error.
      this.logger.warn(`CV text extraction failed: error=${error instanceof Error ? error.name : 'unknown'}`);
      throw new BadRequestException('The file could not be read: it may be corrupt');
    }
  }

  private async pdfText(file: ICvFile): Promise<string> {
    // pdf-parse toma la propiedad (transfiere) del TypedArray que recibe: se le pasa una copia para no dejar `file.data` inutilizable.
    const parser = new PDFParse({ data: file.data.slice() });
    try {
      return (await parser.getText()).text;
    } finally {
      await parser.destroy();
    }
  }

  private async docxText(file: ICvFile): Promise<string> {
    return (await extractRawText({ buffer: Buffer.from(file.data) })).value;
  }
}
