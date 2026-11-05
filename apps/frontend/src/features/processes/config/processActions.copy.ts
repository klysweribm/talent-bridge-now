import type { TProcessStatus } from '@ibm-talent-bridge/shared-types';

export const PROCESS_ACTIONS_COPY = {
  limitsError: 'No se pudieron cargar los límites de la oportunidad: las acciones están deshabilitadas hasta tenerlos.',
  limitsRetry: 'Reintentar',
  readOnlyTerminal: 'Esta oportunidad está cerrada o cancelada: solo lectura.',
  edit: {
    open: 'Editar datos de la oportunidad', save: 'Guardar cambios', saving: 'Guardando…', cancel: 'Cancelar',
    titleLabel: 'Título', clientLabel: 'Cliente', saved: 'Cambios guardados.',
  },
  status: { label: 'Estado', saved: 'Estado actualizado.', remove: 'Eliminar oportunidad', keep: 'Volver', working: 'Guardando…' },
  recruiter: { label: 'Reclutador', placeholder: 'Elige un reclutador', saved: 'Reclutador actualizado.', loadError: 'No se pudieron cargar los reclutadores.' },
  candidates: {
    add: 'Agregar candidato', closeAdd: 'Cerrar', addTitle: 'Candidatos disponibles', added: 'Candidato agregado.', removed: 'Candidato quitado.',
    remove: (name: string): string => `Quitar a ${name}`,
    limitReached: (max: number): string => `Alcanzaste el máximo de ${max} candidatos`,
  },
} as const;

interface IConfirmCopy { readonly title: string; readonly message: string; readonly confirm: string }

/** Confirmaciones de las transiciones a estados terminales. */
export const TERMINAL_CONFIRM_COPY: Readonly<Partial<Record<TProcessStatus, IConfirmCopy>>> = {
  closed: {
    title: '¿Cerrar esta oportunidad?',
    message: 'Una oportunidad cerrada no se puede reabrir ni modificar.',
    confirm: 'Sí, cerrar oportunidad',
  },
  cancelled: {
    title: '¿Eliminar esta oportunidad?',
    message: 'La oportunidad pasará al estado Cancelado y no se podrá reabrir. Sus candidatos quedarán libres para otras oportunidades.',
    confirm: 'Sí, eliminar oportunidad',
  },
};
