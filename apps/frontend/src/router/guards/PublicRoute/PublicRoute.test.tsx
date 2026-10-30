import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useAuthStore } from '@features/auth/store/auth.store';
import { makeJwtExpiringIn } from '../../../test/makeJwt';

const USER = { id: '1', name: 'Ana', email: 'ana@ibm.com', role: 'recruiter' as const };
const ONE_HOUR_S = 3600;

import { PublicRoute } from './PublicRoute';

function renderGuard(): void {
  render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/dashboard" element={<p>dashboard screen</p>} />
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<p>login form</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('PublicRoute', () => {
  beforeEach(() => useAuthStore.getState().clearAuth());

  it('should render the public screen when there is no session', () => {
    renderGuard();
    expect(screen.getByText('login form')).toBeInTheDocument();
  });

  it('should render the public screen when the token is expired', () => {
    useAuthStore.getState().setAuth(USER, makeJwtExpiringIn(-ONE_HOUR_S));
    renderGuard();
    expect(screen.getByText('login form')).toBeInTheDocument();
  });

  it('should redirect to /dashboard when the session is valid', () => {
    useAuthStore.getState().setAuth(USER, makeJwtExpiringIn(ONE_HOUR_S));
    renderGuard();
    expect(screen.getByText('dashboard screen')).toBeInTheDocument();
    expect(screen.queryByText('login form')).not.toBeInTheDocument();
  });
});
