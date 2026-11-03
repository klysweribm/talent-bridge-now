/**
 * Límites de los campos de la oportunidad (PROC-1c). Espejo del backend
 * (`apps/backend/.../processes/domain/constants/process.constants.ts`): el backend es la fuente, aquí solo se replican.
 */
export const OPPORTUNITY_LIMITS = {
  roleMax:        200,
  descriptionMax: 2000,
  skillsMin:      1,
  skillsMax:      15,
  skillMax:       60,
  bandMin:        6,
  bandMax:        10,
} as const;

/** Enteros del rango de banda, en orden ascendente. */
export const OPPORTUNITY_BANDS: readonly number[] = Array.from(
  { length: OPPORTUNITY_LIMITS.bandMax - OPPORTUNITY_LIMITS.bandMin + 1 },
  (_, index) => OPPORTUNITY_LIMITS.bandMin + index,
);

export const OPPORTUNITY_ERRORS = {
  roleRequired:        'El rol de la oportunidad es obligatorio.',
  roleTooLong:         `El rol admite hasta ${OPPORTUNITY_LIMITS.roleMax} caracteres.`,
  descriptionRequired: 'La descripción del rol es obligatoria.',
  descriptionTooLong:  `La descripción admite hasta ${OPPORTUNITY_LIMITS.descriptionMax} caracteres.`,
  skillsRequired:      `Agrega al menos ${OPPORTUNITY_LIMITS.skillsMin} tecnología.`,
  skillsTooMany:       `Puedes agregar hasta ${OPPORTUNITY_LIMITS.skillsMax} tecnologías.`,
  skillTooLong:        `Cada tecnología admite hasta ${OPPORTUNITY_LIMITS.skillMax} caracteres.`,
  skillsDuplicated:    'Hay tecnologías repetidas.',
  bandRequired:        'Elige la banda profesional.',
  bandInvalid:         `La banda debe ser un entero entre ${OPPORTUNITY_LIMITS.bandMin} y ${OPPORTUNITY_LIMITS.bandMax}.`,
} as const;
