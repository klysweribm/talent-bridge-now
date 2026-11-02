import { fakeDocx, fakeLegacyDoc, fakePdf, fakeText, fakeXlsx } from '../testing/cv-fixtures';
import { detectCvFileType, validateCvUpload } from './cv-file.validator';
import type { ICvUploadedFile } from './interfaces/cv-upload.interface';

const MAX = 1024;
const upload = (buffer: Buffer, overrides: Partial<ICvUploadedFile> = {}): ICvUploadedFile => ({
  originalname: 'cv.bin', mimetype: 'application/octet-stream', size: buffer.length, buffer, ...overrides,
});

describe('detectCvFileType', () => {
  it('should detect a PDF by its %PDF- signature', () => {
    expect(detectCvFileType(fakePdf())).toBe('pdf');
  });

  it('should detect a DOCX by the ZIP signature plus the word/ entry', () => {
    expect(detectCvFileType(fakeDocx())).toBe('docx');
  });

  it.each([
    ['legacy .doc (OLE)', fakeLegacyDoc()],
    ['plain text', fakeText()],
    ['a ZIP that is not a DOCX', fakeXlsx()],
    ['an empty buffer', Buffer.alloc(0)],
    ['a PDF signature that is too short', Buffer.from('%PDF')],
  ])('should reject %s', (_name, data) => {
    expect(detectCvFileType(data)).toBeNull();
  });
});

describe('validateCvUpload', () => {
  it('should accept a PDF and use the DETECTED mime type, not the client one', () => {
    const result = validateCvUpload(upload(fakePdf(), { mimetype: 'text/plain', originalname: 'Juan Perez.exe' }), MAX);

    expect(result.ok && [result.file.filename, result.file.mimeType]).toEqual(['cv.pdf', 'application/pdf']);
    expect(result.ok && result.file.data.length).toBe(fakePdf().length);
  });

  it('should accept a DOCX with the OOXML mime type', () => {
    const result = validateCvUpload(upload(fakeDocx()), MAX);

    expect(result).toMatchObject({
      ok: true, file: { filename: 'cv.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
    });
  });

  it.each([
    ['a missing file', undefined, /required/i],
    ['an empty file', upload(Buffer.alloc(0)), /empty/i],
    ['a legacy .doc file', upload(fakeLegacyDoc(), { originalname: 'cv.docx', mimetype: 'application/pdf' }), /\.doc|PDF or DOCX/i],
    ['a plain text file', upload(fakeText()), /PDF or DOCX/i],
    ['a file over the limit', upload(Buffer.concat([fakePdf(), Buffer.alloc(MAX)])), /too large|exceeds/i],
  ])('should reject %s with a clear message', (_name, file, message) => {
    const result = validateCvUpload(file, MAX);

    expect(result.ok).toBe(false);
    expect(result.ok === false && result.message).toMatch(message);
  });
});
