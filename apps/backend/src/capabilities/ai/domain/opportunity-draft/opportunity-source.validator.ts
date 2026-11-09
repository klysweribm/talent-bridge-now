import type { IOpportunityUploadedFile, TOpportunitySourceValidation } from '../interfaces/opportunity-source.interface';

const PDF_SIGNATURE = [0x25, 0x50, 0x44, 0x46, 0x2d]; // %PDF-
const ZIP_SIGNATURE = [0x50, 0x4b, 0x03, 0x04]; // PK\x03\x04
const OLE_SIGNATURE = [0xd0, 0xcf, 0x11, 0xe0]; // .doc heredado
const DOCX_ENTRY = 'word/';

const startsWith = (data: Uint8Array, signature: readonly number[]): boolean =>
  data.length >= signature.length && signature.every((byte, index) => data[index] === byte);

/** MD/TXT: sin bytes NUL y UTF-8 válido (un binario disfrazado de .txt no pasa). */
const isUtf8Text = (data: Uint8Array): boolean => {
  if (data.includes(0)) return false;
  try {
    new TextDecoder('utf-8', { fatal: true }).decode(data);
    return true;
  } catch {
    return false;
  }
};

const fail = (message: string): TOpportunitySourceValidation => ({ ok: false, message });

/**
 * Lista cerrada por FIRMA (no por MIME ni extensión, que el cliente controla): PDF, DOCX (ZIP con `word/`) y texto UTF-8.
 * El tipo lo fija el servidor y el nombre original no se usa.
 */
export function validateOpportunitySource(upload: IOpportunityUploadedFile | undefined, maxBytes: number): TOpportunitySourceValidation {
  if (!upload) return fail('A brochure file is required (multipart field "file")');
  const data = upload.buffer;
  if (data.length === 0) return fail('The brochure file is empty');
  if (data.length > maxBytes) return fail(`The brochure file is too large (it exceeds the ${maxBytes} byte limit)`);
  if (startsWith(data, PDF_SIGNATURE)) return { ok: true, source: { kind: 'pdf', data } };
  if (startsWith(data, ZIP_SIGNATURE)) {
    return new TextDecoder('latin1').decode(data).includes(DOCX_ENTRY)
      ? { ok: true, source: { kind: 'docx', data } }
      : fail('Only PDF, DOCX, MD or TXT files are allowed');
  }
  if (startsWith(data, OLE_SIGNATURE)) return fail('Legacy .doc files are not supported: upload a PDF, DOCX, MD or TXT');
  return isUtf8Text(data) ? { ok: true, source: { kind: 'text', data } } : fail('Only PDF, DOCX, MD or TXT files are allowed');
}
