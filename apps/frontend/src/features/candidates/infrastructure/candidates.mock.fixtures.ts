/** Datos inventados del mock (cv-pii-handling.md). */
export const MOCK_BASE = {
  fullName: 'Persona Inventada', email: 'persona.inventada@example.com',
  primaryRole: 'Backend Developer', seniority: 'sr', yearsExperience: 8,
  location: { country: 'Chile', city: 'Santiago' },
  skills: [{ name: 'Java', level: 5, years: 8 }, { name: 'Kafka' }],
} as const;

export const MOCK_LANGUAGES = [{ code: 'es', level: 'native' }] as const;

export const MOCK_EXPERIENCE = [
  { company: 'Empresa Ficticia', role: 'Backend Developer', from: '2020-03', to: '2024-01', summary: 'Servicios Java y Kafka.' },
  { company: 'Otra Inventada', role: 'Analista', from: '2016-01', to: '2020-02' },
] as const;
export const MOCK_EDUCATION = [{ institution: 'Universidad Ficticia', degree: 'Ingeniería en Informática', year: 2015 }] as const;

/** Nombre de archivo que, en modo clásico, simula que ICA no pudo completar el resultado. */
export const MOCK_CLASSIC_NOT_COMPLETED_MARKER = 'sin-ia';

export const MOCK_UNAVAILABLE_FILE_MARKER = 'ica-down';

/** Nombre de archivo que dispara `matches.exact` (borrador con el correo de un perfil guardado). */
export const MOCK_EXACT_MATCH_FILE_MARKER = 'existente';
/** Nombre de archivo que dispara `matches.similar` (otro correo, mismo nombre). */
export const MOCK_SIMILAR_MATCH_FILE_MARKER = 'parecido';
export const MOCK_EXACT_EMAIL = 'existente@example.com';
export const MOCK_SIMILAR_EMAIL = 'parecido@example.com';
/** Id que `updateCandidate` trata como inexistente (404). */
export const MOCK_NOT_FOUND_ID = 'mock-not-found';

export const MOCK_ACTOR = { id: 'mock-actor', email: 'ana@ibm.com', role: 'recruiter' } as const;

export const MOCK_EXACT_MATCH = {
  id: 'mock-existing', fullName: 'Persona Inventada', email: MOCK_EXACT_EMAIL, primaryRole: 'Backend Developer',
  updatedAt: '2026-03-10T15:00:00.000Z', updatedBy: MOCK_ACTOR, updateCount: 2, reason: 'email',
} as const;

export const MOCK_SIMILAR_MATCH = {
  id: 'mock-similar', fullName: 'Persona Inventada', email: 'otra.persona@example.com',
  updatedAt: '2026-02-01T12:00:00.000Z', updateCount: 0, reason: 'name',
} as const;
