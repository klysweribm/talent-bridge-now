import type { ICandidateProfileDraft } from '@ibm-talent-bridge/shared-types';
import { CANDIDATE_EMAIL_PATTERN, CANDIDATE_LINKEDIN_PATTERN, CANDIDATE_PHONE_PATTERN } from './constants/candidate.constants';
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
const EMAIL_SCAN = /[^\s@|,;<>()]+@[^\s@|,;<>()]+\.[^\s@|,;<>()]{2,}/;
const LINKEDIN_SCAN = /(?:https?:\/\/)?(?:[a-z0-9-]+\.)?linkedin\.com\/[^\s|,;)]+/i;
const PHONE_SCAN = /\+?\d[\d\s().-]{6,22}\d/g;
/** `2019-2024` o `2019 - 2024` no es un teléfono. */
const YEAR_RANGE = /^(?:19|20)\d{2}\s*[-–]\s*(?:19|20)\d{2}$/;

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const lines = (text: string): readonly string[] =>
  text.split(/\r?\n/).map((line) => line.trim()).filter((line) => line.length > 0);

const findName = (all: readonly string[]): string | undefined =>
  all.slice(0, NAME_SCAN_LINES).find((line) => NAME_PATTERN.test(line));

function findEmail(text: string): string | undefined {
  const match = EMAIL_SCAN.exec(text)?.[0];
  return match !== undefined && CANDIDATE_EMAIL_PATTERN.test(match) ? match.toLowerCase() : undefined;
}

function findLinkedIn(text: string): string | undefined {
  const raw = LINKEDIN_SCAN.exec(text)?.[0];
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
export function extractClassicDraft(text: string, skillCatalog: readonly string[]): IClassicExtraction {
  if (text.trim().length < MIN_USEFUL_TEXT_CHARS && !EMAIL_SCAN.test(text)) {
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
