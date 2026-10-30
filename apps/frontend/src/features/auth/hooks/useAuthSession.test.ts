import { renderHook } from '@testing-library/react';
import { useAuthSession } from './useAuthSession';
import { useAuthStore } from '../store/auth.store';
import { makeJwtExpiringIn } from '../../../test/makeJwt';

const USER = { id: '1', name: 'Ana', email: 'ana@ibm.com', role: 'recruiter' as const };
const ONE_HOUR_S = 3600;

describe('useAuthSession', () => {
  beforeEach(() => useAuthStore.getState().clearAuth());

  it('should report no session when the store is empty', () => {
    const { result } = renderHook(() => useAuthSession());
    expect(result.current).toEqual({ isAuthenticated: false, token: null, role: undefined });
  });

  it('should report no session when the token is expired', () => {
    useAuthStore.getState().setAuth(USER, makeJwtExpiringIn(-ONE_HOUR_S));
    const { result } = renderHook(() => useAuthSession());
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should report an authenticated session with token and role when the token is valid', () => {
    const token = makeJwtExpiringIn(ONE_HOUR_S);
    useAuthStore.getState().setAuth(USER, token);
    const { result } = renderHook(() => useAuthSession());
    expect(result.current).toEqual({ isAuthenticated: true, token, role: 'recruiter' });
  });
});
