import { act, renderHook } from '@testing-library/react';
import { useSessionExpiry, MAX_TIMEOUT_MS } from './useSessionExpiry';
import { useAuthStore } from '../store/auth.store';
import { makeJwtExpiringIn } from '../../../test/makeJwt';

const USER = { id: '1', name: 'Ana', email: 'ana@ibm.com', role: 'recruiter' as const };
const SECOND = 1000;

describe('useSessionExpiry', () => {
  let baselineTimers = 0; // timers ajenos al hook (RTL/persist), medidos tras el setup

  beforeEach(() => {
    vi.useFakeTimers();
    useAuthStore.getState().clearAuth();
    baselineTimers = vi.getTimerCount();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('should clear the session once the clock passes exp when the token expires in 60 s', () => {
    const token = makeJwtExpiringIn(60);
    useAuthStore.getState().setAuth(USER, token);
    renderHook(() => useSessionExpiry(token));

    act(() => { vi.advanceTimersByTime(59 * SECOND); });
    expect(useAuthStore.getState().token).toBe(token);

    act(() => { vi.advanceTimersByTime(2 * SECOND); });
    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('should cancel the previous timer when the token changes', () => {
    const first = makeJwtExpiringIn(60);
    const second = makeJwtExpiringIn(3600);
    useAuthStore.getState().setAuth(USER, second);
    const { rerender } = renderHook(({ t }) => useSessionExpiry(t), { initialProps: { t: first } });
    rerender({ t: second });

    act(() => { vi.advanceTimersByTime(120 * SECOND); });

    expect(useAuthStore.getState().token).toBe(second);
    expect(vi.getTimerCount()).toBe(baselineTimers + 1);
  });

  it('should leave no pending timer when unmounted', () => {
    const { unmount } = renderHook(() => useSessionExpiry(makeJwtExpiringIn(60)));
    expect(vi.getTimerCount()).toBe(baselineTimers + 1);
    unmount();
    expect(vi.getTimerCount()).toBe(baselineTimers);
  });

  it('should clear the session on mount when the token is already expired', () => {
    const token = makeJwtExpiringIn(-10);
    useAuthStore.getState().setAuth(USER, token);
    const clearAuthSpy = vi.spyOn(useAuthStore.getState(), 'clearAuth');
    renderHook(() => useSessionExpiry(token));

    expect(useAuthStore.getState().token).toBeNull();
    expect(clearAuthSpy).toHaveBeenCalledTimes(1);
    clearAuthSpy.mockRestore();
  });

  it('should not fire early and should re-arm when exp is beyond the max setTimeout delay', () => {
    const farSeconds = Math.ceil(MAX_TIMEOUT_MS / SECOND) + 10 * 24 * 3600;
    const token = makeJwtExpiringIn(farSeconds);
    useAuthStore.getState().setAuth(USER, token);
    renderHook(() => useSessionExpiry(token));

    act(() => { vi.advanceTimersByTime(MAX_TIMEOUT_MS); });

    expect(useAuthStore.getState().token).toBe(token);
    expect(vi.getTimerCount()).toBe(baselineTimers + 1);
  });

  it('should do nothing when there is no token', () => {
    renderHook(() => useSessionExpiry(null));
    expect(vi.getTimerCount()).toBe(baselineTimers);
  });
});
