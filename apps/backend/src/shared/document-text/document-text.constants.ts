export const DOCUMENT_PDF_MIME = 'application/pdf';
/** Un documento real tiene pocas páginas; el resto de un PDF enorme no se lee. */
export const DOCUMENT_PDF_MAX_PAGES = 20;
/** Tamaño máximo de lo que un DOCX puede descomprimir (zip bomb: pesa poco y ocupa gigas al abrirse). */
export const DOCUMENT_DOCX_MAX_UNCOMPRESSED_BYTES = 20 * 1024 * 1024;
/** Tiempo máximo para extraer el texto de un archivo (el parser corre en el hilo de la petición). */
export const DOCUMENT_PARSE_TIMEOUT_MS = 15_000;
