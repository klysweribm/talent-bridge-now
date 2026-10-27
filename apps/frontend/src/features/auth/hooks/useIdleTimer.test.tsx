import type { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { useAuthStore, type AuthUser } from '@features/auth/store/auth.store';
import { logoutUser } from '@features/auth/infrastructure/auth.infra';
import { ENV } from '@/config/env';
import { ACTIVITY_EVENTS } from './useIdleClock';
import { useIdleTimer } from './useIdleTimer';

vi.mock('@features/auth/infrastructure/auth.infra', () => ({ logoutUser: vi.fn() }));

const mockedLogout = logoutUser as ReturnType<typeof vi.fn>;
const USER: AuthUser = { id: 'a', name: 'Ana', email: 'ana@ibm.com', role: 'recruiter' };
const START = new Date('2026-01-01T10:00:00Z');
const TIMEOUT = ENV.VITE_IDLE_TIMEOUT_SECONDS;
const WARNING = ENV.VITE_IDLE_WARNING_SECONDS;

function wrapper({ children }: { readonly children: ReactNode }): JSX.Element {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return (
    <QueryClientProvider client={client}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

const advance = async (seconds: number): Promise<void> => {
  await act(async () => { await vi.advanceTimersByTimeAsync(seconds * 1000); });
};

describe('useIdleTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(START);
    mockedLogout.mockReset();
    mockedLogout.mockResolvedValue(undefined);
    useAuthStore.getState().setAuth(USER, 'fake-session-value');
  });

  afterEach(() => {
    vi.useRealTimers();
    useAuthStore.getState().clearAuth();
  });

  it('should stay inactive-free (no warning) before the timeout', async () => {
    const { result } = renderHook(useIdleTimer, { wrapper });
    await advance(TIMEOUT - 2);
    expect(result.current.secondsLeft).toBeNull();
  });

  it('should show the warning with the full countdown after the timeout', async () => {
    const { result } = renderHook(useIdleTimer, { wrapper });
    await advance(TIMEOUT);
    expect(result.current.secondsLeft).toBe(WARNING);
    await advance(10);
    expect(result.current.secondsLeft).toBe(WARNING - 10);
  });

  it('should log out with reason idle when the countdown reaches zero', async () => {
    renderHook(useIdleTimer, { wrapper });
    await advance(TIMEOUT + WARNING - 1);
    expect(mockedLogout).not.toHaveBeenCalled();
    await advance(1);
    expect(mockedLogout).toHaveBeenCalledTimes(1);
    expect(mockedLogout).toHaveBeenCalledWith('idle');
    await advance(5);
    expect(mockedLogout).toHaveBeenCalledTimes(1);
  });

  it('should restart the clock when there is activity before the warning', async () => {
    const { result } = renderHook(useIdleTimer, { wrapper });
    await advance(TIMEOUT - 10);
    act(() => { window.dispatchEvent(new Event('keydown')); });
    await advance(TIMEOUT - 10);
    expect(result.current.secondsLeft).toBeNull();
    await advance(10);
    expect(result.current.secondsLeft).toBe(WARNING);
  });

  it('should ignore activity during the warning and cancel only with stayConnected', async () => {
    const { result } = renderHook(useIdleTimer, { wrapper });
    await advance(TIMEOUT + 5);
    act(() => { window.dispatchEvent(new Event('mousemove')); });
    await advance(1);
    expect(result.current.secondsLeft).toBe(WARNING - 6);

    act(() => { result.current.stayConnected(); });
    expect(result.current.secondsLeft).toBeNull();
    await advance(TIMEOUT + WARNING - 1);
    expect(mockedLogout).not.toHaveBeenCalled();
  });

  it('should compute from Date.now so a throttled background tab still logs out', async () => {
    renderHook(useIdleTimer, { wrapper });
    await act(async () => {
      vi.setSystemTime(new Date(START.getTime() + (TIMEOUT + WARNING + 1) * 1000));
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(mockedLogout).toHaveBeenCalledWith('idle');
  });

  it('should remove every listener and stop the interval on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const clearSpy = vi.spyOn(globalThis, 'clearInterval');
    const { unmount } = renderHook(useIdleTimer, { wrapper });
    unmount();
    ACTIVITY_EVENTS.forEach(name => {
      expect(removeSpy).toHaveBeenCalledWith(name, expect.any(Function));
    });
    expect(clearSpy).toHaveBeenCalled();
    removeSpy.mockRestore();
    clearSpy.mockRestore();
  });
});
