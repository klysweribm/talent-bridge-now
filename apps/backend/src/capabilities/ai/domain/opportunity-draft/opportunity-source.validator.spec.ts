import type { IOpportunityUploadedFile } from '../interfaces/opportunity-source.interface';
import { validateOpportunitySource } from './opportunity-source.validator';

/** Solo datos INVENTADOS. */
const upload = (buffer: Buffer): IOpportunityUploadedFile => ({ originalname: 'x', mimetype: 'x', size: buffer.length, buffer });
const withHead = (head: readonly number[], tail: string): Buffer => Buffer.concat([Buffer.from(head), Buffer.from(tail, 'latin1')]);
const PDF = withHead([0x25, 0x50, 0x44, 0x46, 0x2d], 'cuerpo inventado');
const DOCX = withHead([0x50, 0x4b, 0x03, 0x04], 'word/document.xml');
const XLSX = withHead([0x50, 0x4b, 0x03, 0x04], 'xl/workbook.xml');
const OLE = withHead([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1], 'x');
const MAX = 1000;

describe('validateOpportunitySource', () => {
  it.each([
    ['PDF', PDF, 'pdf'],
    ['DOCX', DOCX, 'docx'],
    ['MD/TXT UTF-8', Buffer.from('# Requerimiento\nFullstack ñandú', 'utf8'), 'text'],
  ] as const)('should accept %s by its content', (_name, buffer, kind) => {
    const result = validateOpportunitySource(upload(buffer), MAX);

    expect(result).toEqual({ ok: true, source: { kind, data: buffer } });
  });

  it('should ignore the client MIME and name: a PDF named .txt is still a PDF', () => {
    const result = validateOpportunitySource({ originalname: 'a.txt', mimetype: 'text/plain', size: PDF.length, buffer: PDF }, MAX);

    expect(result).toMatchObject({ ok: true, source: { kind: 'pdf' } });
  });

  it('should reject a missing file', () => {
    expect(validateOpportunitySource(undefined, MAX)).toEqual({ ok: false, message: 'A brochure file is required (multipart field "file")' });
  });

  it('should reject an empty file', () => {
    expect(validateOpportunitySource(upload(Buffer.alloc(0)), MAX)).toEqual({ ok: false, message: 'The brochure file is empty' });
  });

  it('should reject a file over the limit', () => {
    expect(validateOpportunitySource(upload(Buffer.alloc(MAX + 1, 0x61)), MAX)).toEqual({ ok: false, message: `The brochure file is too large (it exceeds the ${MAX} byte limit)` });
  });

  it.each([
    ['xlsx (another zip)', XLSX],
    ['binary disguised as .txt (NUL bytes)', Buffer.from([0x68, 0x6f, 0x00, 0x6c, 0x61])],
    ['invalid UTF-8', Buffer.from([0xff, 0xfe, 0xfa, 0x41])],
  ])('should reject %s', (_name, buffer) => {
    expect(validateOpportunitySource(upload(buffer), MAX)).toEqual({ ok: false, message: 'Only PDF, DOCX, MD or TXT files are allowed' });
  });

  it('should explain that legacy .doc is not supported', () => {
    expect(validateOpportunitySource(upload(OLE), MAX)).toEqual({ ok: false, message: 'Legacy .doc files are not supported: upload a PDF, DOCX, MD or TXT' });
  });
});
