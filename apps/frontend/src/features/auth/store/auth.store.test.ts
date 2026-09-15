import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from './auth.store';

const MOCK_USER = {
  id:    '1',
  name:  'Ana García',
  email: 'ana.garcia@ibm.com',
  role:  'recruiter' as const,
};

describe('useAuthStore', () => {
  beforeEach(() => {
    // Reset store entre tests
    useAuthStore.getState().clearAuth();
  });

  it('should start with null user and token', () => {
    const { result } = renderHook(() => useAuthStore());
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
  });

  it('should set user and token after setAuth', () => {
    const { result } = renderHook(() => useAuthStore());
    act(() => {
      result.current.setAuth(MOCK_USER, 'jwt-token-123');
    });
    expect(result.current.user).toEqual(MOCK_USER);
    expect(result.current.token).toBe('jwt-token-123');
  });

  it('should clear user and token after clearAuth', () => {
    const { result } = renderHook(() => useAuthStore());
    act(() => {
      result.current.setAuth(MOCK_USER, 'jwt-token-123');
    });
    act(() => {
      result.current.clearAuth();
    });
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
  });

  it('should expose the user role after login', () => {
    const { result } = renderHook(() => useAuthStore());
    act(() => {
      result.current.setAuth({ ...MOCK_USER, role: 'pm' }, 'token');
    });
    expect(result.current.user?.role).toBe('pm');
  });
});
