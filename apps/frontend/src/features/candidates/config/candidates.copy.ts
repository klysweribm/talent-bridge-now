import type { TCvExtractor } from '@ibm-talent-bridge/shared-types';
import { EXTRACTION_MAX_SECONDS } from './candidates.constants';

export const NEW_CANDIDATE_TITLE = 'Crear ficha de nuevo candidato';

export const CV_DROPZONE_COPY = {
  fileLabel: 'Archivo del CV',
  prompt: 'Arrastra el CV aquí o haz clic para seleccionar',
  supported: (limit: string): string => `Formatos soportados: PDF o DOCX (máximo ${limit})`,
} as const;

export const CV_ANALYSIS_COPY = {
  title: 'Analizando CV…',
  progressLabel: 'Progreso del análisis del CV',
  waiting: `Extrayendo el perfil… puede tardar hasta ${EXTRACTION_MAX_SECONDS} segundos. No cierres esta página.`,
} as const;

/** Nombre corto del extractor para la frase de palabras clave (las tres variantes ICA se llaman ICA). */
const KEYWORD_SOURCE: Readonly<Record<TCvExtractor, string>> = { ica: 'ICA', 'ica-text': 'ICA', classic: 'Clásica' };

export const CV_RESULT_COPY = {
  analyzed: 'CV analizado',
  selected: 'CV seleccionado',
  remove: 'Quitar CV',
  keywords: (extractor: TCvExtractor): string => `Palabras clave identificadas por ${KEYWORD_SOURCE[extractor]}:`,
} as const;

export const EMAIL_VALID_COPY = 'Formato válido';
