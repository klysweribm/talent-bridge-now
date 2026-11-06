import type { IOpportunityLimits } from '@ibm-talent-bridge/shared-types';

/** Enteros del rango de banda según los límites del servidor, en orden ascendente. */
export function buildOpportunityBands(limits: IOpportunityLimits): readonly number[] {
  return Array.from({ length: limits.bandMax - limits.bandMin + 1 }, (_, index) => limits.bandMin + index);
}

/** Mensajes de validación; los números salen de los límites recibidos de `GET /processes/limits`, nunca de literales. */
export function buildOpportunityErrors(limits: IOpportunityLimits): Readonly<Record<
  'roleRequired' | 'roleTooLong' | 'descriptionRequired' | 'descriptionTooLong' | 'skillsRequired' | 'skillsTooMany'
  | 'skillTooLong' | 'skillsDuplicated' | 'bandRequired' | 'bandInvalid' | 'startDateInvalid', string>> {
  return {
    roleRequired:        'El rol de la oportunidad es obligatorio.',
    roleTooLong:         `El rol admite hasta ${limits.roleMax} caracteres.`,
    descriptionRequired: 'La descripción del rol es obligatoria.',
    descriptionTooLong:  `La descripción admite hasta ${limits.descriptionMax} caracteres.`,
    skillsRequired:      `Agrega al menos ${limits.skillsMin} tecnología.`,
    skillsTooMany:       `Puedes agregar hasta ${limits.skillsMax} tecnologías.`,
    skillTooLong:        `Cada tecnología admite hasta ${limits.skillMax} caracteres.`,
    skillsDuplicated:    'Hay tecnologías repetidas.',
    bandRequired:        'Elige la banda profesional.',
    bandInvalid:         `La banda debe ser un entero entre ${limits.bandMin} y ${limits.bandMax}.`,
    startDateInvalid:    'Ingresa una fecha de inicio válida.',
  };
}
