export const CANDIDATE_PANEL_TEXT = {
  title:        'Agregar candidato',
  titleId:      'add-candidate-panel-title',
  close:        'Cerrar',
  loading:      'Cargando formulario de candidato',
  dismissNotice: 'Cerrar aviso',
  noticeSelected: (name: string): string => `Candidato ${name} creado en la base de candidatos y seleccionado para esta oportunidad.`,
  noticeLimitFull: (name: string, max: number): string => `Candidato ${name} creado. No se seleccionó: ya tienes ${max} de ${max}`,
  noticeUnselected: (name: string): string => `Candidato ${name} creado en la base de candidatos. Selecciónalo de la lista si quieres agregarlo.`,
} as const;

export const DISCARD_DIALOG_TEXT = {
  titleId:     'discard-candidate-title',
  descId:      'discard-candidate-desc',
  dirtyTitle:  '¿Descartar este candidato?',
  dirtyDesc:   'Los datos que escribiste se perderán. La oportunidad no se ve afectada.',
  extractionTitle: 'La extracción sigue en curso. ¿Cerrar y descartar?',
  extractionDesc:  'Si cierras ahora, el resultado de la extracción se ignorará. La oportunidad no se ve afectada.',
  keep:        'Seguir editando',
  discard:     'Descartar',
} as const;
