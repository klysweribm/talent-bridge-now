import { BadRequestException } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import JSZip = require('jszip');
import { CV_DOCX_MAX_UNCOMPRESSED_BYTES, CV_DOCX_MIME, CV_PDF_MIME } from '../../domain/constants/cv.constants';
import type { ICvFile } from '../../domain/interfaces/cv-file.interface';
import { LocalCvTextExtractor } from './local-cv-text-extractor.adapter';

const fixture = (name: string, mimeType: string): ICvFile => ({
  filename: name, mimeType, data: new Uint8Array(readFileSync(join(__dirname, '../../testing/fixtures', name))),
});

describe('LocalCvTextExtractor', () => {
  it.each([['cv-sintetico.pdf', CV_PDF_MIME], ['cv-sintetico.docx', CV_DOCX_MIME]])('should read the text of %s', async (name, mime) => {
    const text = await new LocalCvTextExtractor().extractText(fixture(name, mime));

    expect(text).toContain('Lucia Fernandez Ortega');
    expect(text).toContain('lucia.fernandez.demo@example.com');
  });

  it('should not consume the original buffer of a PDF', async () => {
    const file = fixture('cv-sintetico.pdf', CV_PDF_MIME);
    const before = file.data.length;

    await new LocalCvTextExtractor().extractText(file);

    expect(file.data.length).toBe(before);
  });

  it('should throw 400 for unreadable content', async () => {
    const corrupt: ICvFile = { filename: 'cv.pdf', mimeType: CV_PDF_MIME, data: new Uint8Array(Buffer.from('%PDF-1.4 basura no valida')) };

    await expect(new LocalCvTextExtractor().extractText(corrupt)).rejects.toBeInstanceOf(BadRequestException);
  });
});

describe('LocalCvTextExtractor resource bounds', () => {
  /** DOCX mínimo cuyo word/document.xml se descomprime a mucho más de lo permitido, pero pesa poco comprimido (zip bomb de prueba). */
  async function bombDocx(uncompressedBytes: number): Promise<ICvFile> {
    const zip = new JSZip();
    zip.file('[Content_Types].xml', '<Types/>');
    zip.file('word/document.xml', 'A'.repeat(uncompressedBytes));
    const data = await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE', compressionOptions: { level: 9 } });
    return { filename: 'cv.docx', mimeType: CV_DOCX_MIME, data };
  }

  it('should reject a DOCX whose decompressed size exceeds the limit, without handing it to mammoth', async () => {
    const bomb = await bombDocx(CV_DOCX_MAX_UNCOMPRESSED_BYTES + 1);

    expect(bomb.data.length).toBeLessThan(200_000); // pesa poco comprimido: pasaría el tope de subida
    await expect(new LocalCvTextExtractor().extractText(bomb)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should still read a normal DOCX', async () => {
    const text = await new LocalCvTextExtractor().extractText(fixture('cv-sintetico.docx', CV_DOCX_MIME));

    expect(text).toContain('Lucia Fernandez Ortega');
  });

  it('should give up with a 400 when parsing takes longer than the time budget', async () => {
    const slow = new LocalCvTextExtractor(20);
    jest.spyOn(slow as unknown as { docxText: () => Promise<string> }, 'docxText').mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve('tarde'), 500)),
    );

    await expect(slow.extractText(fixture('cv-sintetico.docx', CV_DOCX_MIME))).rejects.toBeInstanceOf(BadRequestException);
  });
});
