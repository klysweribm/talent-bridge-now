import type { TCvExtractor, TLanguageProficiency } from '@ibm-talent-bridge/shared-types';
import { ENV } from '@/config/env';

export const CV_MAX_FILE_BYTES = ENV.VITE_CV_MAX_FILE_BYTES;

/** Lista cerrada: PDF y DOCX (el `.doc` heredado no se acepta). */
export const CV_ACCEPTED_EXTENSIONS = ['.pdf', '.docx'] as const;
export const CV_ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;
export const CV_ACCEPT_ATTRIBUTE = [...CV_ACCEPTED_EXTENSIONS, ...CV_ACCEPTED_MIME_TYPES].join(',');

/** Única fuente de los modos: orden de presentación, etiqueta y ayuda. */
export const EXTRACTOR_MODES: readonly TCvExtractor[] = ['ica-text', 'ica', 'classic'];
export const DEFAULT_EXTRACTOR: TCvExtractor = 'ica-text';

export const EXTRACTOR_LABELS: Readonly<Record<TCvExtractor, string>> = {
  ica: 'ICA (archivo)',
  'ica-text': 'ICA (texto)',
  classic: 'Clásica',
};

export const EXTRACTOR_HINTS: Readonly<Record<TCvExtractor, string>> = {
  ica: 'Sube el archivo a ICA; puede tardar hasta 90 segundos.',
  'ica-text': 'Extrae el texto del CV y lo analiza con IA; es el modo recomendado.',
  classic: 'Lee el CV con reglas locales y lo completa con IA si está disponible',
};

export const CLASSIC_COMPLETED_LABEL = 'Clásica completada con IA';

export const EXTRACTION_MAX_SECONDS = 90;
export const BYTES_PER_KIB = 1024;
export const BYTES_PER_MIB = BYTES_PER_KIB * BYTES_PER_KIB;

export const LANGUAGE_LEVEL_LABELS: Readonly<Record<TLanguageProficiency, string>> = {
  basic: 'Básico',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
  native: 'Nativo',
};

export const EXTRA_SECTION_LABELS = {
  title: 'Datos adicionales del candidato',
  experience: 'Experiencia',
  education: 'Educación',
  languages: 'Idiomas',
} as const;

export const FIELD_LABELS = {
  fullName: 'Nombre completo',
  email: 'Correo',
  phone: 'Teléfono',
  linkedIn: 'LinkedIn',
  country: 'País',
  city: 'Ciudad',
  primaryRole: 'Rol principal',
  seniority: 'Seniority',
  yearsExperience: 'Años de experiencia',
  skills: 'Skills',
  summary: 'Resumen',
} as const;

/** `missingFields` del backend (nombres del esquema) → clave del campo del formulario. */
export const MISSING_FIELD_TO_FORM_FIELD: Readonly<Record<string, keyof typeof FIELD_LABELS>> = {
  fullName: 'fullName', email: 'email', phone: 'phone', linkedIn: 'linkedIn',
  'location.country': 'country', 'location.city': 'city', location: 'country',
  primaryRole: 'primaryRole', seniority: 'seniority', yearsExperience: 'yearsExperience',
  skills: 'skills', summary: 'summary',
};

export const AUDIT_LOCALE = 'es-CL';

export const AUDIT_COPY = {
  lastUpdate: 'Última actualización:',
  by: 'por',
  noActor: 'Sin registro de quién lo actualizó',
  neverUpdated: 'Aún no se ha actualizado',
  updatedOnce: 'Actualizado 1 vez',
  updatedMany: 'Actualizado',
  times: 'veces',
} as const;

export const MATCH_COPY = {
  exactTitle: 'Este perfil ya existe y se va a actualizar al confirmar.',
  exactReplace: 'Los campos del perfil guardado serán reemplazados por los valores del formulario (lo que falte en el formulario se borra del perfil).',
  similarTitle: 'Hay perfiles parecidos con otro correo',
  similarNonBlocking: 'Puedes crear este candidato igualmente.',
} as const;

export const MATCH_REASON_LABELS = {
  email: 'mismo correo',
  name: 'mismo nombre',
  phone: 'mismo teléfono',
} as const;

export const SUBMIT_LABELS = {
  create: 'Confirmar y crear candidato',
  update: 'Actualizar candidato',
} as const;

export const RESULT_COPY = {
  created: 'Candidato creado:',
  updated: 'Candidato actualizado:',
  updatedBy: 'Actualizado por',
  createError: 'No pudimos crear el candidato. Inténtalo de nuevo.',
  updateError: 'No pudimos actualizar el candidato. Inténtalo de nuevo.',
  notFound: 'El candidato que intentas actualizar ya no existe. Vuelve y crea uno nuevo.',
} as const;

export const DUPLICATE_COPY = {
  title: 'Ya existe un candidato con ese correo. No se creó uno nuevo.',
  updateExisting: 'Actualizar el existente',
  emailNote: 'Se usará el correo del perfil existente',
  updatingExisting: 'Se actualizará el perfil existente con los valores del formulario. Se usará el correo del perfil existente.',
} as const;
