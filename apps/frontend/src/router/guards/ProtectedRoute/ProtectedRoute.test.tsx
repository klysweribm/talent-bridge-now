import { act, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useAuthStore } from '@features/auth/store/auth.store';
import { makeJwtExpiringIn } from '../../../test/makeJwt';

const USER = { id: '1', name: 'Ana', email: 'ana@ibm.com', role: 'recruiter' as const };
const ONE_HOUR_S = 3600;

import { ProtectedRoute } from './ProtectedRoute';

function renderGuard(): void {
  render(
    <MemoryRouter initialEntries={['/private']}>
      <Routes>
        <Route path="/login" element={<p>login screen</p>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/private" element={<p>private content</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => useAuthStore.getState().clearAuth());

  it('should redirect to /login when there is no session', () => {
    renderGuard();
    expect(screen.getByText('login screen')).toBeInTheDocument();
  });

  it('should redirect to /login when the token is expired', () => {
    useAuthStore.getState().setAuth(USER, makeJwtExpiringIn(-ONE_HOUR_S));
    renderGuard();
    expect(screen.getByText('login screen')).toBeInTheDocument();
    expect(screen.queryByText('private content')).not.toBeInTheDocument();
  });

  it('should render the child routes when the session is valid', () => {
    useAuthStore.getState().setAuth(USER, makeJwtExpiringIn(ONE_HOUR_S));
    renderGuard();
    expect(screen.getByText('private content')).toBeInTheDocument();
  });

  it('should clear a stale persisted token instead of keeping it in the store', () => {
    useAuthStore.getState().setAuth(USER, makeJwtExpiringIn(-ONE_HOUR_S));
    renderGuard();
    expect(useAuthStore.getState().token).toBeNull();
  });

  it('should clear the session and redirect when the token expires while mounted', () => {
    vi.useFakeTimers();
    const expiresInSeconds = 60;
    useAuthStore.getState().setAuth(USER, makeJwtExpiringIn(expiresInSeconds));
    renderGuard();

    act(() => { vi.advanceTimersByTime((expiresInSeconds + 1) * 1000); });

    expect(useAuthStore.getState().token).toBeNull();
    expect(screen.getByText('login screen')).toBeInTheDocument();
    vi.useRealTimers();
  });
});
