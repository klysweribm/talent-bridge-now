import type { TProcessStatus } from '@ibm-talent-bridge/shared-types';

export const PROCESS_ACTIONS_COPY = {
  readOnlyTerminal: 'Este proceso está cerrado o cancelado: solo lectura.',
  edit: {
    open: 'Editar título y cliente', save: 'Guardar cambios', saving: 'Guardando…', cancel: 'Cancelar',
    titleLabel: 'Título', clientLabel: 'Cliente', saved: 'Cambios guardados.',
  },
  status: { label: 'Estado', saved: 'Estado actualizado.', remove: 'Eliminar proceso', keep: 'Volver', working: 'Guardando…' },
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
    title: '¿Cerrar este proceso?',
    message: 'Un proceso cerrado no se puede reabrir ni modificar.',
    confirm: 'Sí, cerrar proceso',
  },
  cancelled: {
    title: '¿Eliminar este proceso?',
    message: 'El proceso pasará a Cancelado y no se podrá reabrir. Sus candidatos quedarán libres para otros procesos.',
    confirm: 'Sí, eliminar proceso',
  },
};
