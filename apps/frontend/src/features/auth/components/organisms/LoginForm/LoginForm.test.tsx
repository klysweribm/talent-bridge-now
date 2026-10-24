import { render, screen, waitFor, type RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginForm } from './LoginForm';
import { useAuthStore } from '@features/auth/store/auth.store';
import { loginUser } from '@features/auth/infrastructure/auth.infra';

vi.mock('@features/auth/infrastructure/auth.infra', () => ({
  loginUser: vi.fn(),
}));

const mockedLoginUser = loginUser as ReturnType<typeof vi.fn>;

function renderWithRouter(): RenderResult {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('LoginForm', () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
    mockedLoginUser.mockReset();
  });

  it('should render the email, password and submit fields', () => {
    renderWithRouter();
    expect(screen.getByLabelText(/correo corporativo/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('should show a validation error for an invalid email format', async () => {
    renderWithRouter();
    await userEvent.type(screen.getByLabelText(/correo corporativo/i), 'not-an-email');
    await userEvent.type(screen.getByLabelText('Contraseña'), '123456');
    await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));
    expect(await screen.findByText('Ingresa un correo válido.')).toBeInTheDocument();
  });

  it('should show a mutation error for valid-format but wrong credentials', async () => {
    mockedLoginUser.mockRejectedValue(new Error('Usuario no provisionado'));
    renderWithRouter();
    await userEvent.type(screen.getByLabelText(/correo corporativo/i), 'user@gmail.com');
    await userEvent.type(screen.getByLabelText('Contraseña'), '123456');
    await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Usuario no provisionado');
    }, { timeout: 2000 });
  });

  it('should set auth on valid IBM credentials', async () => {
    mockedLoginUser.mockResolvedValue({
      user: { id: '1', email: 'ana@ibm.com', role: 'recruiter', name: 'Ana García' },
      token: 'jwt-abc',
    });
    renderWithRouter();
    await userEvent.type(screen.getByLabelText(/correo corporativo/i), 'ana@ibm.com');
    await userEvent.type(screen.getByLabelText('Contraseña'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));
    await waitFor(() => {
      expect(useAuthStore.getState().token).toBe('jwt-abc');
    }, { timeout: 2000 });
  });
});
