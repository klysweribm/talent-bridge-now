import type { TProcessCreateStep } from './processCreate.constants';

export const PROCESS_STEP_LABELS: Readonly<Record<TProcessCreateStep, string>> = {
  data:       'Datos',
  candidates: 'Candidatos',
  confirm:    'Confirmar',
};

/** Candidatos por página en el paso 2. */
export const AVAILABLE_CANDIDATES_PAGE_SIZE = 20;
export const SKELETON_ROWS = 5;

export const WIZARD_TEXT = {
  pageTitle:        'Nueva oportunidad',
  stepperLabel:     'Pasos para crear la oportunidad',
  completedMark:    'completado',
  next:             'Siguiente',
  back:             'Atrás',
  retry:            'Reintentar',
  edit:             'Editar',
  unassigned:       'Sin asignar',
} as const;

export const DATA_STEP_TEXT = {
  heading:         'Datos de la oportunidad',
  title:           'Título *',
  titleHint:       'Nombre del rol o la posición que se busca.',
  client:          'Cliente *',
  clientHint:      'Empresa para la que se hace la selección.',
  pm:              'Project Manager *',
  pmPlaceholder:   'Selecciona un PM',
  pmHint:          'Responsable de la oportunidad.',
  recruiter:       'Reclutador',
  recruiterHint:   'Opcional. Si no eliges a nadie, solo tú gestionas los candidatos.',
  unassigned:      'Sin asignar',
  usersError:     'No se pudo cargar la lista de usuarios.',
  errorsBanner:    (count: number): string => (count === 1 ? 'Hay 1 error en el formulario.' : `Hay ${count} errores en el formulario.`),
  counter:         (used: number, max: number): string => `${used}/${max}`,
} as const;

export const CANDIDATES_STEP_TEXT = {
  heading:      'Candidatos',
  counter:      (selected: number, max: number): string => `${selected} de ${max}`,
  limitReached: (max: number): string => `Alcanzaste el máximo de ${max} candidatos`,
  empty:        'No hay candidatos disponibles',
  loading:      'Cargando candidatos',
  error:        'No se pudieron cargar los candidatos.',
  add:          '+ Agregar candidato',
  rowLabel:     (name: string, role?: string): string => (role ? `${name} · ${role}` : name),
} as const;

export const CONFIRM_STEP_TEXT = {
  heading:        'Confirmar y crear',
  dataSection:    'Datos',
  candidatesSection: 'Candidatos',
  titleLabel:     'Título',
  clientLabel:    'Cliente',
  pmLabel:        'Project Manager',
  recruiterLabel: 'Reclutador',
  noCandidates:   'Aún sin candidatos',
  roleLabel:      'Rol de la oportunidad',
  skillsLabel:    'Stack tecnológico',
  bandLabel:      'Banda profesional',
  startDateLabel: 'Fecha de inicio',
  descriptionLabel: 'Expectativas de evaluación técnica',
  band:           (band: number): string => `Band ${band}`,
  create:         'Crear oportunidad',
  creating:       'Creando…',
  cancel:         'Cancelar y descartar',
  genericError:   'No se pudo crear la oportunidad. Intenta de nuevo.',
} as const;
