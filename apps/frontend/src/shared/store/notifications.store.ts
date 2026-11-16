import { create } from 'zustand';
import { NOTIFICATIONS_SEED } from '@shared/config/notifications.mock';

/** Notificaciones del shell: estado cliente en memoria (sin persistencia); mock hasta que exista backend. */
export interface INotification {
  readonly id:    string;
  readonly title: string;
  readonly body:  string;
  readonly time:  string;
  readonly read:  boolean;
}

interface NotificationsState {
  readonly items: readonly INotification[];
}

interface NotificationsActions {
  markRead:    (id: string) => void;
  markAllRead: () => void;
}

export const selectUnreadCount = (state: NotificationsState): number =>
  state.items.filter(item => !item.read).length;

export const useNotificationsStore = create<NotificationsState & NotificationsActions>()((set) => ({
  items: NOTIFICATIONS_SEED,

  markRead: (id) =>
    set(state => ({ items: state.items.map(item => (item.id === id ? { ...item, read: true } : item)) })),

  markAllRead: () =>
    set(state => ({ items: state.items.map(item => ({ ...item, read: true })) })),
}));
