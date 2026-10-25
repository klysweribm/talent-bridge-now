import { act, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppRouter } from './AppRouter';
import { useAuthStore } from '@features/auth/store/auth.store';
import { NAVIGATION_ITEMS } from '@shared/config/navigation';
import { makeJwtExpiringIn } from '../test/makeJwt';

const DEMO_USER = { id: '1', name: 'Ana García', email: 'ana@ibm.com', role: 'recruiter' as const };

const PERSIST_KEY = 'ibm-talent-bridge-auth';
const ONE_HOUR_S = 3600;
const validToken = (): string => makeJwtExpiringIn(ONE_HOUR_S);

// Simula F5: sesión persistida en sessionStorage + rehidratación del store.
async function simulateReload(token: string): Promise<void> {
  sessionStorage.setItem(PERSIST_KEY, JSON.stringify({ state: { user: DEMO_USER, token }, version: 0 }));
  await useAuthStore.persist.rehydrate();
}

// Registra si algún nodo con `text` llegó a insertarse en el DOM, aunque un efecto
// lo retire antes de que `render` devuelva (act vacía los efectos).
function watchForPaint(text: string): () => boolean {
  const observer = new MutationObserver(() => undefined);
  observer.observe(document.body, { childList: true, subtree: true });
  return () => {
    const painted = observer.takeRecords().some(record =>
      Array.from(record.addedNodes).some(node => node.textContent?.includes(text)));
    observer.disconnect();
    return painted;
  };
}

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
      useAuthStore.getState().setAuth({ ...DEMO_USER, role }, validToken());
      renderAt(path);
      expect(screen.queryByText('Página no encontrada')).not.toBeInTheDocument();
    },
  );

  it('should redirect to /login when there is no session', () => {
    renderAt('/dashboard');
    expect(screen.getByLabelText(/correo corporativo/i)).toBeInTheDocument();
  });

  it('should send the user back to /login once the session is cleared (what a 401 does)', () => {
    useAuthStore.getState().setAuth(DEMO_USER, validToken());
    renderAt('/dashboard');
    expect(screen.getByText('Dashboard de Reclutamiento')).toBeInTheDocument();

    act(() => useAuthStore.getState().clearAuth());

    expect(screen.getByLabelText(/correo corporativo/i)).toBeInTheDocument();
  });

  it('should redirect an unauthorized role away from a role-restricted section instead of 404ing', () => {
    useAuthStore.getState().setAuth({ ...DEMO_USER, role: 'recruiter' }, validToken());
    renderAt('/feedback'); // feedback es solo para technical_ref
    expect(screen.getByText('Dashboard de Reclutamiento')).toBeInTheDocument();
  });

  it('should redirect a pm away from /interviews, which is only for recruiter and technical_ref', () => {
    useAuthStore.getState().setAuth({ ...DEMO_USER, role: 'pm' }, validToken());
    renderAt('/interviews');
    expect(screen.getByText('Dashboard de Reclutamiento')).toBeInTheDocument();
  });

  it('should let a technical_ref reach /interviews and /feedback without redirecting', () => {
    useAuthStore.getState().setAuth({ ...DEMO_USER, role: 'technical_ref' }, validToken());
    renderAt('/interviews');
    expect(screen.queryByText('Dashboard de Reclutamiento')).not.toBeInTheDocument();

    renderAt('/feedback');
    expect(screen.queryByText('Dashboard de Reclutamiento')).not.toBeInTheDocument();
  });

  it('should render the real DashboardPage, not ComingSoon, for /dashboard', () => {
    useAuthStore.getState().setAuth(DEMO_USER, validToken());
    renderAt('/dashboard');
    expect(screen.getByText('Dashboard de Reclutamiento')).toBeInTheDocument();
  });

  it('should render ComingSoon for a protected section without a real screen yet', () => {
    useAuthStore.getState().setAuth({ ...DEMO_USER, role: 'pm' }, validToken());
    renderAt('/reports');
    expect(screen.getByText('Esta sección está en construcción. El equipo de IBM Talent Bridge está trabajando en ella — vuelve pronto.')).toBeInTheDocument();
  });

  it('should render the 404 view inside the layout (sidebar visible) for an unknown authenticated route', () => {
    useAuthStore.getState().setAuth(DEMO_USER, validToken());
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

  describe('session restored after a reload (F5)', () => {
    afterEach(() => {
      vi.useRealTimers();
      sessionStorage.clear();
    });

    it('should show the login and never paint the dashboard when the persisted token is expired', async () => {
      await simulateReload(makeJwtExpiringIn(-ONE_HOUR_S));
      const wasPainted = watchForPaint('Dashboard de Reclutamiento');
      renderAt('/dashboard');

      expect(wasPainted()).toBe(false);
      expect(screen.queryByText('Dashboard de Reclutamiento')).not.toBeInTheDocument();
      expect(screen.getByLabelText(/correo corporativo/i)).toBeInTheDocument();
      expect(useAuthStore.getState().token).toBeNull();
      expect(useAuthStore.getState().user).toBeNull();
    });

    it('should show the dashboard when the persisted token is still valid', async () => {
      await simulateReload(validToken());
      renderAt('/dashboard');

      expect(screen.getByText('Dashboard de Reclutamiento')).toBeInTheDocument();
    });

    it('should redirect to /login without a reload when the token expires while the screen is open', () => {
      vi.useFakeTimers();
      const expiresInSeconds = 60;
      useAuthStore.getState().setAuth(DEMO_USER, makeJwtExpiringIn(expiresInSeconds));
      renderAt('/dashboard');
      expect(screen.getByText('Dashboard de Reclutamiento')).toBeInTheDocument();

      act(() => { vi.advanceTimersByTime((expiresInSeconds + 1) * 1000); });

      expect(screen.getByLabelText(/correo corporativo/i)).toBeInTheDocument();
      expect(useAuthStore.getState().token).toBeNull();
    });
  });
});
