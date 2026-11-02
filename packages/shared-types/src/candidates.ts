// CANDIDATES — extracción de CV a borrador de perfil y alta de candidato externo. Solo tipos.
// El borrador nunca se persiste: una persona lo revisa y confirma antes de crear el `Candidate`.

import type { ILanguageLevel, IBenchLocation, ISkillLevel, TSeniority } from './bench';
import type { TAiUnavailableReason } from './ai';
import type { UserRole } from './index';

/**
 * Quién produjo el borrador. `ica` = el archivo se sube a ICA (`files`); `ica-text` = el backend extrae el texto y
 * lo envía a ICA como mensaje, sin subir el archivo; `classic` = extracción local por reglas.
 */
export type TCvExtractor = 'ica' | 'ica-text' | 'classic';

/** Un candidato recién creado es tentativo hasta que entre en un proceso. */
export type TCandidateStatus = 'tentative';

/** Habilidad detectada en el CV: el nivel y los años pueden faltar. */
export interface IDraftSkill extends Partial<Omit<ISkillLevel, 'name'>> {
  readonly name: string;
}

export interface IDraftEducation {
  readonly institution?: string;
  readonly degree?: string;
  readonly year?: number;
}

export interface IDraftExperience {
  readonly company?: string;
  readonly role?: string;
  readonly from?: string;
  readonly to?: string;
  readonly summary?: string;
}

/** Perfil extraído de un CV. Todo es opcional: lo que falte lo completa una persona. */
export interface ICandidateProfileDraft {
  readonly fullName?: string;
  readonly email?: string;
  readonly phone?: string;
  readonly linkedIn?: string;
  readonly location?: Partial<IBenchLocation>;
  readonly primaryRole?: string;
  readonly seniority?: TSeniority;
  readonly yearsExperience?: number;
  readonly skills?: readonly IDraftSkill[];
  readonly languages?: readonly ILanguageLevel[];
  readonly education?: readonly IDraftEducation[];
  readonly experience?: readonly IDraftExperience[];
  readonly summary?: string;
}

/** `POST /candidates/cv-extraction`. No persiste nada. */
export interface ICvExtractionResult {
  readonly extractor: TCvExtractor;
  /** Solo con `extractor: 'classic'`: ICA completó los campos que las reglas no detectaron. Ausente = solo reglas. */
  readonly completedWith?: 'ica-text';
  readonly draft: ICandidateProfileDraft;
  /** Campos del borrador que el extractor no pudo rellenar. */
  readonly missingFields: readonly string[];
  readonly warnings: readonly string[];
  /** Perfiles ya guardados que coinciden con el borrador. Ausente = sin coincidencias o la búsqueda no estuvo disponible. */
  readonly matches?: ICandidateMatches;
}

/** Cuerpo de error 503 cuando ICA no está disponible (nunca 401). */
export interface ICvExtractionUnavailable {
  readonly reason: TAiUnavailableReason;
}

/** `POST /candidates`. El email es obligatorio y único. */
export interface ICreateCandidateRequest extends Omit<ICandidateProfileDraft, 'email' | 'fullName'> {
  readonly email: string;
  readonly fullName: string;
}

/** Quién hizo un cambio, tomado de su sesión (JWT). Nunca viene del cuerpo de la petición. */
export interface ICandidateActor {
  readonly id: string;
  readonly email: string;
  readonly role: UserRole;
}

/** Candidato externo persistido. */
export interface ICandidate extends ICreateCandidateRequest {
  readonly id: string;
  readonly status: TCandidateStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
  /** Ausente en los candidatos creados antes de la auditoría. */
  readonly createdBy?: ICandidateActor;
  readonly updatedBy?: ICandidateActor;
  /** Cuántas veces se actualizó el perfil desde su creación (0 = nunca). */
  readonly updateCount: number;
}

/** Por qué un perfil guardado coincide con el borrador. */
export type TCandidateMatchReason = 'email' | 'name' | 'phone';

/** Resumen de un perfil guardado que coincide (nunca el documento completo). */
export interface ICandidateMatch {
  readonly id: string;
  readonly fullName: string;
  readonly email: string;
  readonly phone?: string;
  readonly primaryRole?: string;
  readonly updatedAt: string;
  readonly updatedBy?: ICandidateActor;
  readonly updateCount: number;
  readonly reason: TCandidateMatchReason;
}

/** `exact` = mismo correo: guardar actualiza ese perfil. `similar` = otro correo pero mismo nombre o teléfono: solo aviso. */
export interface ICandidateMatches {
  readonly exact?: ICandidateMatch;
  readonly similar: readonly ICandidateMatch[];
}
