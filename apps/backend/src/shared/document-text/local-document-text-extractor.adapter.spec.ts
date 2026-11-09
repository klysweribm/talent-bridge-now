import { BadRequestException } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import JSZip = require('jszip');
import type { IDocumentFile } from './document-file.interface';
import { DOCUMENT_DOCX_MAX_UNCOMPRESSED_BYTES, DOCUMENT_PDF_MIME } from './document-text.constants';
import { LocalDocumentTextExtractor } from './local-document-text-extractor.adapter';

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

const fixture = (name: string, mimeType: string): IDocumentFile => ({
  filename: name, mimeType, data: new Uint8Array(readFileSync(join(__dirname, 'testing/fixtures', name))),
});

describe('LocalDocumentTextExtractor', () => {
  it.each([['cv-sintetico.pdf', DOCUMENT_PDF_MIME], ['cv-sintetico.docx', DOCX_MIME]])('should read the text of %s', async (name, mime) => {
    const text = await new LocalDocumentTextExtractor().extractText(fixture(name, mime));

    expect(text).toContain('Lucia Fernandez Ortega');
    expect(text).toContain('lucia.fernandez.demo@example.com');
  });

  it('should not consume the original buffer of a PDF', async () => {
    const file = fixture('cv-sintetico.pdf', DOCUMENT_PDF_MIME);
    const before = file.data.length;

    await new LocalDocumentTextExtractor().extractText(file);

    expect(file.data.length).toBe(before);
  });

  it('should throw 400 for unreadable content', async () => {
    const corrupt: IDocumentFile = { filename: 'cv.pdf', mimeType: DOCUMENT_PDF_MIME, data: new Uint8Array(Buffer.from('%PDF-1.4 basura no valida')) };

    await expect(new LocalDocumentTextExtractor().extractText(corrupt)).rejects.toBeInstanceOf(BadRequestException);
  });
});

/** PDF de una página sin contenido de texto (como un escaneado), armado a mano: sin binarios en el repo. */
function blankPdf(): IDocumentFile {
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 600 200] >>',
  ];
  let body = '%PDF-1.4\n';
  const offsets = objects.map((object, index) => {
    const offset = body.length;
    body += `${index + 1} 0 obj\n${object}\nendobj\n`;
    return offset;
  });
  const rows = offsets.map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('');
  body += `xref\n0 4\n0000000000 65535 f \n${rows}trailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n${body.length}\n%%EOF\n`;
  return { filename: 'scan.pdf', mimeType: DOCUMENT_PDF_MIME, data: new Uint8Array(Buffer.from(body, 'latin1')) };
}

describe('LocalDocumentTextExtractor page markers', () => {
  const MARKER = /--\s*\d+\s+of\s+\d+\s*--/;

  it('should return blank text, without page markers, for a PDF with no text', async () => {
    const text = await new LocalDocumentTextExtractor().extractText(blankPdf());

    expect(text).not.toMatch(MARKER);
    expect(text.trim()).toBe('');
  });

  it('should not leak page markers into the text of a PDF with text', async () => {
    const text = await new LocalDocumentTextExtractor().extractText(fixture('cv-sintetico.pdf', DOCUMENT_PDF_MIME));

    expect(text).toContain('Lucia Fernandez Ortega');
    expect(text).not.toMatch(MARKER);
  });
});

describe('LocalDocumentTextExtractor resource bounds', () => {
  /** DOCX mínimo cuyo word/document.xml se descomprime a mucho más de lo permitido, pero pesa poco comprimido (zip bomb de prueba). */
  async function bombDocx(uncompressedBytes: number): Promise<IDocumentFile> {
    const zip = new JSZip();
    zip.file('[Content_Types].xml', '<Types/>');
    zip.file('word/document.xml', 'A'.repeat(uncompressedBytes));
    const data = await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE', compressionOptions: { level: 9 } });
    return { filename: 'cv.docx', mimeType: DOCX_MIME, data };
  }

  it('should reject a DOCX whose decompressed size exceeds the limit, without handing it to mammoth', async () => {
    const bomb = await bombDocx(DOCUMENT_DOCX_MAX_UNCOMPRESSED_BYTES + 1);

    expect(bomb.data.length).toBeLessThan(200_000); // pesa poco comprimido: pasaría el tope de subida
    await expect(new LocalDocumentTextExtractor().extractText(bomb)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should still read a normal DOCX', async () => {
    const text = await new LocalDocumentTextExtractor().extractText(fixture('cv-sintetico.docx', DOCX_MIME));

    expect(text).toContain('Lucia Fernandez Ortega');
  });

  it('should give up with a 400 when parsing takes longer than the time budget', async () => {
    const slow = new LocalDocumentTextExtractor(20);
    jest.spyOn(slow as unknown as { docxText: () => Promise<string> }, 'docxText').mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve('tarde'), 500)),
    );

    await expect(slow.extractText(fixture('cv-sintetico.docx', DOCX_MIME))).rejects.toBeInstanceOf(BadRequestException);
  });
});
