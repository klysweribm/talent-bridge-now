import type { ICandidateProfileDraft } from '@ibm-talent-bridge/shared-types';
import { CANDIDATE_EMAIL_MAX, CANDIDATE_EMAIL_PATTERN, CANDIDATE_LINKEDIN_PATTERN, CANDIDATE_PHONE_PATTERN } from './constants/candidate.constants';
import { CV_TEXT_MAX_CHARS } from './constants/cv.constants';
import { compact } from './cv-draft.reader';

export interface IClassicExtraction {
  readonly draft: ICandidateProfileDraft;
  readonly warnings: readonly string[];
}

/** Menos caracteres que esto = casi sin texto (PDF escaneado o vacío): el modo clásico no hace OCR. */
const MIN_USEFUL_TEXT_CHARS = 20;
/** Un nombre se busca solo en las primeras líneas no vacías. */
const NAME_SCAN_LINES = 3;
const NAME_PATTERN = /^\p{Lu}[\p{L}'.-]*(?:\s+\p{Lu}[\p{L}'.-]*){1,3}$/u;
const PHONE_SCAN = /\+?\d[\d\s().-]{6,22}\d/g;
/** `2019-2024` o `2019 - 2024` no es un teléfono. */
const YEAR_RANGE = /^(?:19|20)\d{2}\s*[-–]\s*(?:19|20)\d{2}$/;

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const lines = (text: string): readonly string[] =>
  text.split(/\r?\n/).map((line) => line.trim()).filter((line) => line.length > 0);

const findName = (all: readonly string[]): string | undefined =>
  all.slice(0, NAME_SCAN_LINES).find((line) => NAME_PATTERN.test(line));

/** Separadores que no forman parte de una dirección dentro del texto de un CV. */
const EMAIL_TOKEN_SPLIT = /[\s|,;<>()]+/;

/**
 * Busca el correo por palabras separadas por espacios, no con una regex sobre todo el texto: una sola palabra
 * enorme (CV hostil) volvía cuadrática la regex anterior y bloqueaba el servidor. Las palabras más largas que una
 * dirección válida se descartan sin examinarlas.
 */
function findEmailToken(text: string): string | undefined {
  return text.split(EMAIL_TOKEN_SPLIT).find(
    (token) => token.length <= CANDIDATE_EMAIL_MAX && token.includes('@') && CANDIDATE_EMAIL_PATTERN.test(token),
  );
}

const findEmail = (text: string): string | undefined => findEmailToken(text)?.toLowerCase();

/** Una URL de LinkedIn razonable cabe de sobra en esto; las palabras más largas se descartan sin examinarlas. */
const LINKEDIN_TOKEN_MAX = 300;
const LINKEDIN_HOST = /^(?:https?:\/\/)?(?:[a-z0-9-]+\.)?linkedin\.com\/\S+$/i;

/** Por palabras (misma razón que el correo): la regex sobre todo el texto era cuadrática con una palabra enorme. */
function findLinkedIn(text: string): string | undefined {
  const raw = text.split(/[\s|,;)]+/).find((token) => token.length <= LINKEDIN_TOKEN_MAX && LINKEDIN_HOST.test(token));
  if (raw === undefined) return undefined;
  const url = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  return CANDIDATE_LINKEDIN_PATTERN.test(url) ? url : undefined;
}

const findPhone = (text: string): string | undefined =>
  (text.match(PHONE_SCAN) ?? []).map((candidate) => candidate.trim())
    .find((candidate) => !YEAR_RANGE.test(candidate) && CANDIDATE_PHONE_PATTERN.test(candidate));

/** Skills del catálogo de la banca que aparecen como token completo (sin distinguir mayúsculas), en el orden del catálogo. */
function findSkills(text: string, catalog: readonly string[]): readonly { readonly name: string }[] {
  return catalog
    .filter((name) => new RegExp(`(?<![\\p{L}\\p{N}+#])${escapeRegex(name)}(?![\\p{L}\\p{N}+#])`, 'iu').test(text))
    .map((name) => ({ name }));
}

/**
 * Extracción por reglas: es una heurística. Rellena lo que puede (nombre, email, teléfono, LinkedIn y skills
 * del catálogo) y deja el resto sin tocar. Solo produce valores que encajan en el esquema; el texto del CV es
 * dato y jamás se interpreta como instrucción.
 */
export function extractClassicDraft(fullText: string, skillCatalog: readonly string[]): IClassicExtraction {
  // Tope de entrada: un DOCX/PDF de pocos MB puede dar millones de caracteres. Los datos de contacto están al principio.
  const text = fullText.length > CV_TEXT_MAX_CHARS ? fullText.slice(0, CV_TEXT_MAX_CHARS) : fullText;
  if (text.trim().length < MIN_USEFUL_TEXT_CHARS && findEmailToken(text) === undefined) {
    return { draft: {}, warnings: ['Se extrajo muy poco texto del archivo. Si es un PDF escaneado, el modo clásico no hace OCR.'] };
  }
  const skills = findSkills(text, skillCatalog);
  const draft: ICandidateProfileDraft = compact({
    fullName: findName(lines(text)),
    email: findEmail(text),
    phone: findPhone(text),
    linkedIn: findLinkedIn(text),
    skills: skills.length > 0 ? skills : undefined,
  });
  return { draft, warnings: [] };
}
