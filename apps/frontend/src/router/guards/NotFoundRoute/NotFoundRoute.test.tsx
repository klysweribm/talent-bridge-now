import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useAuthStore } from '@features/auth/store/auth.store';
import { makeJwtExpiringIn } from '../../../test/makeJwt';

const USER = { id: '1', name: 'Ana', email: 'ana@ibm.com', role: 'recruiter' as const };
const ONE_HOUR_S = 3600;

import { NotFoundRoute } from './NotFoundRoute';

function renderGuard(): void {
  render(<QueryClientProvider client={new QueryClient()}><MemoryRouter><NotFoundRoute /></MemoryRouter></QueryClientProvider>);
}

describe('NotFoundRoute', () => {
  beforeEach(() => useAuthStore.getState().clearAuth());

  it('should offer a link to /login without the layout when there is no session', () => {
    renderGuard();
    expect(screen.getByRole('link', { name: 'Ir a iniciar sesión' })).toHaveAttribute('href', '/login');
    expect(screen.queryByLabelText('Navegación principal')).not.toBeInTheDocument();
  });

  it('should render inside the layout with a link to /dashboard when the session is valid', () => {
    useAuthStore.getState().setAuth(USER, makeJwtExpiringIn(ONE_HOUR_S));
    renderGuard();
    expect(screen.getByRole('link', { name: 'Volver al dashboard' })).toHaveAttribute('href', '/dashboard');
    expect(screen.getAllByLabelText('Navegación principal').length).toBeGreaterThan(0);
  });
});
