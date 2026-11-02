import { CV_DOCX_MIME, CV_PDF_MIME } from './constants/cv.constants';
import type { ICvFile } from './interfaces/cv-file.interface';
import type { ICvUploadedFile } from './interfaces/cv-upload.interface';

export type TCvFileType = 'pdf' | 'docx';
export type TCvUploadValidation = { readonly ok: true; readonly file: ICvFile } | { readonly ok: false; readonly message: string };

const PDF_SIGNATURE = [0x25, 0x50, 0x44, 0x46, 0x2d]; // %PDF-
const ZIP_SIGNATURE = [0x50, 0x4b, 0x03, 0x04]; // PK\x03\x04
const OLE_SIGNATURE = [0xd0, 0xcf, 0x11, 0xe0]; // .doc heredado
const DOCX_ENTRY = 'word/';

const startsWith = (data: Uint8Array, signature: readonly number[]): boolean =>
  data.length >= signature.length && signature.every((byte, index) => data[index] === byte);

/**
 * Lista cerrada por FIRMA del archivo (no por MIME ni extensión, que el cliente controla).
 * Un DOCX es un ZIP con la entrada `word/`; otro ZIP (xlsx, pptx, jar) no pasa.
 */
export function detectCvFileType(data: Uint8Array): TCvFileType | null {
  if (startsWith(data, PDF_SIGNATURE)) return 'pdf';
  if (startsWith(data, ZIP_SIGNATURE) && new TextDecoder('latin1').decode(data).includes(DOCX_ENTRY)) return 'docx';
  return null;
}

const fail = (message: string): TCvUploadValidation => ({ ok: false, message });

/** El nombre y el MIME del resultado los decide el servidor: el nombre original puede llevar datos personales. */
export function validateCvUpload(upload: ICvUploadedFile | undefined, maxBytes: number): TCvUploadValidation {
  if (!upload) return fail('A CV file is required (multipart field "file")');
  const { buffer } = upload;
  if (buffer.length === 0) return fail('The CV file is empty');
  if (buffer.length > maxBytes) return fail(`The CV file is too large (it exceeds the ${maxBytes} byte limit)`);
  const type = detectCvFileType(buffer);
  if (type === null) {
    return fail(
      startsWith(buffer, OLE_SIGNATURE)
        ? 'Legacy .doc files are not supported: upload a PDF or DOCX'
        : 'Only PDF or DOCX files are allowed',
    );
  }
  return { ok: true, file: { filename: `cv.${type}`, mimeType: type === 'pdf' ? CV_PDF_MIME : CV_DOCX_MIME, data: buffer } };
}
