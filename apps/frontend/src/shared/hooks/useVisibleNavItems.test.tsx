import { renderHook } from '@testing-library/react';
import { useAuthStore } from '@features/auth/store/auth.store';
import { useVisibleNavItems } from './useVisibleNavItems';

describe('useVisibleNavItems', () => {
  it('should filter by the session role', () => {
    useAuthStore.getState().setAuth({ id: 'r', name: 'Rita', email: 'rita@ibm.com', role: 'recruiter' }, 'fake-session-value');
    const { result } = renderHook(() => useVisibleNavItems());

    expect(result.current.map(i => i.path)).toEqual(['/dashboard', '/bench', '/processes', '/interviews', '/reports']);
  });

  it.each([['pm', true], ['recruiter', true], ['technical_ref', false]] as const)(
    'should %s see "Banca": %s', (role, visible) => {
      useAuthStore.getState().setAuth({ id: 'x', name: 'X', email: 'x@ibm.com', role }, 'fake-session-value');
      const { result } = renderHook(() => useVisibleNavItems());

      expect(result.current.some(i => i.path === '/bench')).toBe(visible);
    },
  );

  it('should return nothing without a session', () => {
    useAuthStore.getState().clearAuth();
    const { result } = renderHook(() => useVisibleNavItems());

    expect(result.current).toEqual([]);
  });
});
