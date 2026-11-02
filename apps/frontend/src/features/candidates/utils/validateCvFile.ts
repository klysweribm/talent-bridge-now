import { CV_ACCEPTED_EXTENSIONS, CV_MAX_FILE_BYTES } from '../config/candidates.constants';
import { formatFileSize, formatSizeLimit } from './formatFileSize';

/** Validación previa al envío (la firma real la comprueba el backend). Devuelve el motivo o `null`. */
export function validateCvFile(file: File): string | null {
  const name = file.name.toLowerCase();
  if (!CV_ACCEPTED_EXTENSIONS.some(extension => name.endsWith(extension))) {
    return 'Solo se aceptan archivos PDF o DOCX.';
  }
  if (file.size === 0) return 'El archivo está vacío.';
  if (file.size > CV_MAX_FILE_BYTES) {
    return `El archivo pesa ${formatFileSize(file.size)} y el máximo es ${formatSizeLimit(CV_MAX_FILE_BYTES)}.`;
  }
  return null;
}
