import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NOTIFICATIONS_SEED } from '@shared/config/notifications.mock';
import { selectUnreadCount, useNotificationsStore } from '@shared/store/notifications.store';
import { NotificationsPanel } from './NotificationsPanel';

describe('NotificationsPanel', () => {
  beforeEach(() => { useNotificationsStore.setState({ items: NOTIFICATIONS_SEED }); });

  it('should list the notifications and mark them all as read', async () => {
    render(<NotificationsPanel onClose={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'Notificaciones' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Hace|Ayer/ })).toHaveLength(4);
    await userEvent.click(screen.getByRole('button', { name: 'Marcar todas como leídas' }));
    expect(selectUnreadCount(useNotificationsStore.getState())).toBe(0);
  });

  it('should mark one as read on click and close with Escape', async () => {
    const onClose = vi.fn();
    render(<NotificationsPanel onClose={onClose} />);

    await userEvent.click(screen.getByRole('button', { name: /Nuevo candidato recibido/ }));
    expect(selectUnreadCount(useNotificationsStore.getState())).toBe(2);
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
