import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { useAuthStore } from '@features/auth/store/auth.store';
import { logoutUser } from '@features/auth/infrastructure/auth.infra';
import { HttpError } from '@shared/infrastructure/httpError';
import { SidebarNav } from './SidebarNav';

vi.mock('@features/auth/infrastructure/auth.infra', () => ({ logoutUser: vi.fn() }));

const mockedLogout = logoutUser as ReturnType<typeof vi.fn>;

function renderSidebar(): ReturnType<typeof render> {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter><SidebarNav /></MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('SidebarNav logout', () => {
  beforeEach(() => {
    mockedLogout.mockReset();
    useAuthStore.getState().setAuth(
      { id: 'a', name: 'Ana', email: 'ana@ibm.com', role: 'recruiter' }, 'fake-session-value',
    );
  });

  it('should call the backend with reason manual before clearing the session', async () => {
    let tokenAtCall: string | null = null;
    mockedLogout.mockImplementation(() => { tokenAtCall = useAuthStore.getState().token; return Promise.resolve(); });
    renderSidebar();

    await userEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }));

    await waitFor(() => expect(useAuthStore.getState().token).toBeNull());
    expect(mockedLogout).toHaveBeenCalledWith('manual');
    expect(tokenAtCall).toBe('fake-session-value');
  });

  it('should clear the session even when the backend call fails', async () => {
    mockedLogout.mockRejectedValue(new HttpError(401, 'Unauthorized'));
    renderSidebar();

    await userEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }));

    await waitFor(() => expect(useAuthStore.getState().token).toBeNull());
    expect(useAuthStore.getState().user).toBeNull();
  });
});
