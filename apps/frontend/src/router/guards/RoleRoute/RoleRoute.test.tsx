import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useAuthStore } from '@features/auth/store/auth.store';
import { makeJwtExpiringIn } from '../../../test/makeJwt';

const USER = { id: '1', name: 'Ana', email: 'ana@ibm.com', role: 'recruiter' as const };
const ONE_HOUR_S = 3600;

import { RoleRoute } from './RoleRoute';

function renderGuard(): void {
  render(
    <MemoryRouter initialEntries={['/restricted']}>
      <Routes>
        <Route path="/dashboard" element={<p>dashboard screen</p>} />
        <Route element={<RoleRoute allowedRoles={['recruiter', 'pm']} />}>
          <Route path="/restricted" element={<p>restricted content</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('RoleRoute', () => {
  beforeEach(() => useAuthStore.getState().clearAuth());

  it('should render the child routes when the role is allowed', () => {
    useAuthStore.getState().setAuth(USER, makeJwtExpiringIn(ONE_HOUR_S));
    renderGuard();
    expect(screen.getByText('restricted content')).toBeInTheDocument();
  });

  it('should redirect to /dashboard when the role is not allowed', () => {
    useAuthStore.getState().setAuth({ ...USER, role: 'technical_ref' }, makeJwtExpiringIn(ONE_HOUR_S));
    renderGuard();
    expect(screen.getByText('dashboard screen')).toBeInTheDocument();
  });

  it('should redirect to /dashboard when there is no role', () => {
    renderGuard();
    expect(screen.getByText('dashboard screen')).toBeInTheDocument();
  });
});
