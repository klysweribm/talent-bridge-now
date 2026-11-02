import type { ICvExtractionResult, TCvExtractor } from '@ibm-talent-bridge/shared-types';
import { CvExtractionUnavailableError } from './candidates.errors';
import {
  MOCK_CLASSIC_NOT_COMPLETED_MARKER, MOCK_EDUCATION, MOCK_BASE, MOCK_EXACT_EMAIL, MOCK_EXACT_MATCH, MOCK_EXACT_MATCH_FILE_MARKER,
  MOCK_EXPERIENCE, MOCK_LANGUAGES, MOCK_SIMILAR_EMAIL, MOCK_SIMILAR_MATCH, MOCK_SIMILAR_MATCH_FILE_MARKER, MOCK_UNAVAILABLE_FILE_MARKER,
} from './candidates.mock.fixtures';
function isUnavailable(file: File, mode: TCvExtractor): boolean {
  return mode !== 'classic' && file.name.includes(MOCK_UNAVAILABLE_FILE_MARKER);
}

function mockClassic(file: File): ICvExtractionResult {
  const completed = !file.name.includes(MOCK_CLASSIC_NOT_COMPLETED_MARKER);
  return {
    extractor: 'classic',
    ...(completed ? { completedWith: 'ica-text' as const } : {}),
    draft: completed
      ? { ...MOCK_BASE, phone: '+56 9 0000 0000', languages: [{ code: 'en', level: 'advanced' }], experience: MOCK_EXPERIENCE }
      : { ...MOCK_BASE },
    missingFields: completed ? ['linkedIn'] : ['phone', 'linkedIn', 'languages'],
    warnings: completed ? [] : ['Extracción local: ICA no pudo completar los datos; revisa antes de confirmar.'],
  };
}

/** Con el marcador en el nombre del archivo, el borrador trae el correo de un perfil guardado / parecido. */
function withMatches(file: File, result: ICvExtractionResult): ICvExtractionResult {
  if (file.name.includes(MOCK_EXACT_MATCH_FILE_MARKER)) {
    return { ...result, draft: { ...result.draft, email: MOCK_EXACT_EMAIL }, matches: { exact: MOCK_EXACT_MATCH, similar: [] } };
  }
  if (file.name.includes(MOCK_SIMILAR_MATCH_FILE_MARKER)) {
    return { ...result, draft: { ...result.draft, email: MOCK_SIMILAR_EMAIL }, matches: { similar: [MOCK_SIMILAR_MATCH] } };
  }
  return result;
}

export function mockExtraction(file: File, mode: TCvExtractor): ICvExtractionResult {
  return withMatches(file, buildExtraction(file, mode));
}

function buildExtraction(file: File, mode: TCvExtractor): ICvExtractionResult {
  if (isUnavailable(file, mode)) throw new CvExtractionUnavailableError('UNREACHABLE');
  if (mode === 'classic') return mockClassic(file);
  const languages = MOCK_LANGUAGES;
  const rich = { ...MOCK_BASE, languages, phone: '+56 9 0000 0000', experience: MOCK_EXPERIENCE, education: MOCK_EDUCATION };
  return {
    extractor: mode,
    draft: mode === 'ica' ? rich : { ...rich, linkedIn: 'https://linkedin.com/in/persona-inventada', languages: [...languages, { code: 'en', level: 'intermediate' }] },
    missingFields: mode === 'ica' ? ['linkedIn'] : [],
    warnings: [],
  };
}
