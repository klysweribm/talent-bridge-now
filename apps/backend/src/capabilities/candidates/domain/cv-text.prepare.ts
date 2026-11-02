import { CV_TEXT_CLOSE_TAG, CV_TEXT_MAX_CHARS } from './constants/cv.constants';

export interface IPreparedCvText {
  readonly text: string;
  readonly truncated: boolean;
}

const CLOSE_TAG_PATTERN = /<\s*\/\s*cv\s*>/gi;
const OPEN_TAG_PATTERN = /<\s*cv\s*>/gi;

/**
 * Deja el texto del CV listo para ir entre `<cv>` y `</cv>`: neutraliza cualquier etiqueta `<cv>`/`</cv>`
 * (con espacios o mayúsculas) para que el CV no pueda cerrar el bloque, y lo acota a `CV_TEXT_MAX_CHARS`.
 */
export function prepareCvText(raw: string, maxChars: number = CV_TEXT_MAX_CHARS): IPreparedCvText {
  const neutral = raw.replace(CLOSE_TAG_PATTERN, '[/cv]').replace(OPEN_TAG_PATTERN, '[cv]').trim();
  const truncated = neutral.length > maxChars;
  return { text: truncated ? neutral.slice(0, maxChars) : neutral, truncated };
}

export const wrapCvText = (text: string): string => `<cv>\n${text}\n${CV_TEXT_CLOSE_TAG}`;
