import type { INotification } from '@shared/store/notifications.store';

/** Notificaciones simuladas (mock-first): se reemplazan por la API cuando exista. */
export const NOTIFICATIONS_SEED: readonly INotification[] = [
  { id: 'n1', title: 'Nuevo candidato recibido', body: 'Lucía Fernández fue propuesta para Backend Developer.', time: 'Hace 5 min', read: false },
  { id: 'n2', title: 'Entrevista confirmada', body: 'El referente técnico confirmó la entrevista de mañana.', time: 'Hace 1 h', read: false },
  { id: 'n3', title: 'Feedback pendiente', body: 'Falta el feedback de la entrevista del lunes.', time: 'Ayer', read: false },
  { id: 'n4', title: 'Oportunidad actualizada', body: 'Se actualizó el stack de la oportunidad Cloud Architect.', time: 'Hace 2 días', read: true },
] as const;
