import type { TCvExtractor } from '@ibm-talent-bridge/shared-types';

// Arrays de runtime locales: `shared-types` es solo tipos (la imagen de producción no resuelve el alias).
export const CV_EXTRACTION_MODES: readonly TCvExtractor[] = ['ica', 'ica-text', 'classic'];

/** Tamaño máximo por defecto si `CV_MAX_FILE_BYTES` falta o es inválida (5 MiB). */
export const CV_DEFAULT_MAX_FILE_BYTES = 5_242_880;

/** Throttle de `POST /candidates/cv-extraction`: mucho más estricto que el global (cada llamada cuesta IA). */
export const CV_EXTRACTION_THROTTLE_LIMIT = 5;
export const CV_EXTRACTION_THROTTLE_TTL_MS = 60_000;

export const CV_PDF_MIME = 'application/pdf';
export const CV_DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

export const CV_UPLOAD_CONFIG = Symbol('CV_UPLOAD_CONFIG');
export const CV_EXTRACTORS = Symbol('CV_EXTRACTORS');

/** Tope de caracteres del texto del CV que se envía en línea a ICA (el resto se descarta con un aviso). */
export const CV_TEXT_MAX_CHARS = 60_000;

/** Etiqueta que delimita el CV dentro del mensaje; el texto del CV no puede contener su cierre. */
export const CV_TEXT_CLOSE_TAG = '</cv>';
