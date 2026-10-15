import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppRouter } from './AppRouter';
import { useAuthStore } from '@features/auth/store/auth.store';
import { NAVIGATION_ITEMS } from '@shared/config/navigation';

const DEMO_USER = { id: '1', name: 'Ana García', email: 'ana@ibm.com', role: 'recruiter' as const };

function renderAt(path: string): ReturnType<typeof render> {
  window.history.pushState({}, '', path);
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <AppRouter />
    </QueryClientProvider>,
  );
}

describe('AppRouter — navigation/route consistency', () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
  });

  it.each(NAVIGATION_ITEMS.map(item => [item.path, item.roles[0]] as const))(
    'should not render the 404 view for the sidebar item %s',
    (path, role) => {
      useAuthStore.getState().setAuth({ ...DEMO_USER, role }, 'token');
      renderAt(path);
      expect(screen.queryByText('Página no encontrada')).not.toBeInTheDocument();
    },
  );

  it('should redirect to /login when there is no session', () => {
    renderAt('/dashboard');
    expect(screen.getByLabelText(/correo corporativo/i)).toBeInTheDocument();
  });

  it('should redirect an unauthorized role away from a role-restricted section instead of 404ing', () => {
    useAuthStore.getState().setAuth({ ...DEMO_USER, role: 'recruiter' }, 'token');
    renderAt('/feedback'); // feedback es solo para technical_ref
    expect(screen.getByText('Dashboard de Reclutamiento')).toBeInTheDocument();
  });

  it('should redirect a pm away from /interviews, which is only for recruiter and technical_ref', () => {
    useAuthStore.getState().setAuth({ ...DEMO_USER, role: 'pm' }, 'token');
    renderAt('/interviews');
    expect(screen.getByText('Dashboard de Reclutamiento')).toBeInTheDocument();
  });

  it('should let a technical_ref reach /interviews and /feedback without redirecting', () => {
    useAuthStore.getState().setAuth({ ...DEMO_USER, role: 'technical_ref' }, 'token');
    renderAt('/interviews');
    expect(screen.queryByText('Dashboard de Reclutamiento')).not.toBeInTheDocument();

    renderAt('/feedback');
    expect(screen.queryByText('Dashboard de Reclutamiento')).not.toBeInTheDocument();
  });

  it('should render the real DashboardPage, not ComingSoon, for /dashboard', () => {
    useAuthStore.getState().setAuth(DEMO_USER, 'token');
    renderAt('/dashboard');
    expect(screen.getByText('Dashboard de Reclutamiento')).toBeInTheDocument();
  });

  it('should render ComingSoon for a protected section without a real screen yet', () => {
    useAuthStore.getState().setAuth({ ...DEMO_USER, role: 'pm' }, 'token');
    renderAt('/reports');
    expect(screen.getByText('Esta sección está en construcción. El equipo de IBM Talent Bridge está trabajando en ella — vuelve pronto.')).toBeInTheDocument();
  });

  it('should render the 404 view inside the layout (sidebar visible) for an unknown authenticated route', () => {
    useAuthStore.getState().setAuth(DEMO_USER, 'token');
    renderAt('/this-route-does-not-exist');
    expect(screen.getByText('Página no encontrada')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Volver al dashboard' })).toBeInTheDocument();
    expect(screen.getAllByLabelText('Navegación principal').length).toBeGreaterThan(0);
  });

  it('should render the 404 view without the layout for an unauthenticated unknown route', () => {
    renderAt('/this-route-does-not-exist');
    expect(screen.getByText('Página no encontrada')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ir a iniciar sesión' })).toBeInTheDocument();
  });
});
