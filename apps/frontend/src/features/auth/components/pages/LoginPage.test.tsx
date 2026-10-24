import { render, screen, waitFor, type RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginPage } from './LoginPage';
import { useAuthStore } from '@features/auth/store/auth.store';
import { loginUser } from '@features/auth/infrastructure/auth.infra';

vi.mock('@features/auth/infrastructure/auth.infra', () => ({
  loginUser: vi.fn(),
}));

const mockedLoginUser = loginUser as ReturnType<typeof vi.fn>;

// Wrap con MemoryRouter (LoginPage usa useNavigate) y QueryClientProvider
// (LoginForm usa useMutation vía useLoginForm)
function renderWithRouter(): RenderResult {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
    mockedLoginUser.mockReset();
  });

  it('should render login form elements', () => {
    renderWithRouter();
    expect(screen.getByLabelText(/correo corporativo/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('should toggle password visibility', async () => {
    renderWithRouter();
    const pwdInput = screen.getByLabelText('Contraseña');
    expect(pwdInput).toHaveAttribute('type', 'password');
    await userEvent.click(screen.getByLabelText('Mostrar contraseña'));
    expect(pwdInput).toHaveAttribute('type', 'text');
    await userEvent.click(screen.getByLabelText('Ocultar contraseña'));
    expect(pwdInput).toHaveAttribute('type', 'password');
  });

  it('should show error when credentials are invalid', async () => {
    mockedLoginUser.mockRejectedValue(new Error('Usuario no provisionado'));
    renderWithRouter();
    await userEvent.type(screen.getByLabelText(/correo corporativo/i), 'user@gmail.com');
    await userEvent.type(screen.getByLabelText('Contraseña'), '123456');
    await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Usuario no provisionado');
    }, { timeout: 2000 });
  });

  it('should set auth and NOT show error on valid IBM credentials', async () => {
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

  it('should render IBM Talent Bridge heading', () => {
    renderWithRouter();
    expect(screen.getByText('Talent Bridge')).toBeInTheDocument();
  });

  it('should render SSO button', () => {
    renderWithRouter();
    expect(screen.getByLabelText('Acceder con IBM w3id SSO')).toBeInTheDocument();
  });
});
