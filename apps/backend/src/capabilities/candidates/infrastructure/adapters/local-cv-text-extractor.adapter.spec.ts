import { BadRequestException } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import { CV_DOCX_MIME, CV_PDF_MIME } from '../../domain/constants/cv.constants';
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
