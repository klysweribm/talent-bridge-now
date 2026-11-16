import { NOTIFICATIONS_SEED } from '@shared/config/notifications.mock';
import { selectUnreadCount, useNotificationsStore } from './notifications.store';

describe('notifications.store', () => {
  beforeEach(() => { useNotificationsStore.setState({ items: NOTIFICATIONS_SEED }); });

  it('should start with the seed and count the unread ones', () => {
    const state = useNotificationsStore.getState();
    expect(state.items).toHaveLength(4);
    expect(selectUnreadCount(state)).toBe(3);
  });

  it('should mark a single notification as read', () => {
    useNotificationsStore.getState().markRead('n1');
    expect(selectUnreadCount(useNotificationsStore.getState())).toBe(2);
  });

  it('should mark all as read', () => {
    useNotificationsStore.getState().markAllRead();
    expect(selectUnreadCount(useNotificationsStore.getState())).toBe(0);
  });
});
