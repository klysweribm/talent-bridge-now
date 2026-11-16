import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { useAuthStore } from '@features/auth/store/auth.store';
import { NOTIFICATIONS_SEED } from '@shared/config/notifications.mock';
import { useNotificationsStore } from '@shared/store/notifications.store';
import { useUiStore } from '@shared/store/ui.store';
import { Topbar } from './Topbar';

function setup(): void {
  useAuthStore.getState().setAuth({ id: 'a', name: 'Ana Pérez', email: 'ana@ibm.com', role: 'recruiter' }, 'fake-session-value');
  render(
    <QueryClientProvider client={new QueryClient()}><MemoryRouter><Topbar /></MemoryRouter></QueryClientProvider>,
  );
}

describe('Topbar', () => {
  beforeEach(() => {
    useUiStore.setState({ activePanel: null });
    useNotificationsStore.setState({ items: NOTIFICATIONS_SEED });
  });

  it('should show the unread count and open the notifications panel', async () => {
    setup();
    const bell = screen.getByRole('button', { name: 'Notificaciones (3 sin leer)' });

    await userEvent.click(bell);

    expect(bell).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('dialog', { name: 'Notificaciones' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Marcar todas como leídas' }));
    expect(screen.getByRole('button', { name: 'Notificaciones' })).toBeInTheDocument();
  });

  it('should open the search panel, close it with Escape and return focus to the trigger', async () => {
    setup();
    const trigger = screen.getByRole('button', { name: 'Buscar' });

    await userEvent.click(trigger);
    expect(screen.getByRole('dialog', { name: 'Búsqueda global' })).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
