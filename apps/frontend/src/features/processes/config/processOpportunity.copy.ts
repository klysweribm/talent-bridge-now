import { OPPORTUNITY_LIMITS } from './processOpportunity.constants';

/** Textos de los campos de la oportunidad (PROC-1c), compartidos por el paso 1 y la edición del detalle. */
export const OPPORTUNITY_COPY = {
  role:             'Rol de la oportunidad *',
  roleHint:         'Posición concreta que cubrirá la persona.',
  skills:           'Stack tecnológico *',
  skillsHint:       `Escribe una tecnología y presiona Enter o coma (máximo ${OPPORTUNITY_LIMITS.skillsMax}).`,
  skillsListLabel:  'Tecnologías agregadas',
  skillsLimit:      `Alcanzaste el máximo de ${OPPORTUNITY_LIMITS.skillsMax} tecnologías.`,
  skillDuplicate:   'Esa tecnología ya está en la lista.',
  removeSkill:      (skill: string): string => `Quitar ${skill}`,
  band:             'Banda profesional *',
  bandOption:       (band: number): string => `Banda ${band}`,
  description:      'Expectativas de evaluación técnica *',
  descriptionHint:  'Qué se espera evaluar en las entrevistas técnicas.',
  counter:          (used: number, max: number): string => `${used}/${max}`,
} as const;
