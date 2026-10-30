import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useAuthStore } from '@features/auth/store/auth.store';
import { makeJwtExpiringIn } from '../../../test/makeJwt';
import { AuthenticatedShell } from './AuthenticatedShell';

const USER = { id: '1', name: 'Ana', email: 'ana@ibm.com', role: 'recruiter' as const };

function renderShell(): void {
  render(
    <QueryClientProvider client={new QueryClient()}>
    <MemoryRouter initialEntries={['/inside']}>
      <Routes>
        <Route element={<AuthenticatedShell />}>
          <Route path="/inside" element={<p>inner content</p>} />
        </Route>
      </Routes>
    </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('AuthenticatedShell', () => {
  beforeEach(() => useAuthStore.getState().clearAuth());

  it('should render the nested route inside the app layout', () => {
    useAuthStore.getState().setAuth(USER, makeJwtExpiringIn(3600));
    renderShell();
    expect(screen.getByText('inner content')).toBeInTheDocument();
    expect(screen.getAllByLabelText('Navegación principal').length).toBeGreaterThan(0);
  });
});
