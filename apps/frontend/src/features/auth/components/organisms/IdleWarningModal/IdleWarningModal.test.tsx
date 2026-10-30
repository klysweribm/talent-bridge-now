import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { useAuthStore, type AuthUser } from '@features/auth/store/auth.store';
import { logoutUser } from '@features/auth/infrastructure/auth.infra';
import { ENV } from '@/config/env';
import { IdleWarningModal } from './IdleWarningModal';

vi.mock('@features/auth/infrastructure/auth.infra', () => ({ logoutUser: vi.fn() }));

const mockedLogout = logoutUser as ReturnType<typeof vi.fn>;
const USER: AuthUser = { id: 'a', name: 'Ana', email: 'ana@ibm.com', role: 'recruiter' };

function renderModal(): void {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter><IdleWarningModal /></MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('IdleWarningModal', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date('2026-01-01T10:00:00Z'));
    mockedLogout.mockReset();
    mockedLogout.mockResolvedValue(undefined);
    useAuthStore.getState().setAuth(USER, 'fake-session-value');
  });

  afterEach(() => {
    vi.useRealTimers();
    useAuthStore.getState().clearAuth();
  });

  const goIdle = (): void => {
    act(() => { vi.advanceTimersByTime(ENV.VITE_IDLE_TIMEOUT_SECONDS * 1000 + 1000); });
  };

  it('should render nothing while the user is active', () => {
    renderModal();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('should show the countdown and both actions once idle', () => {
    renderModal();
    goIdle();
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByText(`${ENV.VITE_IDLE_WARNING_SECONDS - 1} s`)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Seguir conectado' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cerrar sesión' })).toBeInTheDocument();
  });

  it('should dismiss the warning when clicking Seguir conectado', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderModal();
    goIdle();
    await user.click(screen.getByRole('button', { name: 'Seguir conectado' }));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(mockedLogout).not.toHaveBeenCalled();
  });

  it('should log out with reason manual when clicking Cerrar sesión', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderModal();
    goIdle();
    await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }));
    expect(mockedLogout).toHaveBeenCalledWith('manual');
  });
});
