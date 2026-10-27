import type { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { useAuthStore, type AuthUser } from '@features/auth/store/auth.store';
import { logoutUser } from '@features/auth/infrastructure/auth.infra';
import { HttpError } from '@shared/infrastructure/httpError';
import { useLogoutMutation } from './useLogoutMutation';

vi.mock('@features/auth/infrastructure/auth.infra', () => ({ logoutUser: vi.fn() }));

const mockedLogout = logoutUser as ReturnType<typeof vi.fn>;
const USER: AuthUser = { id: 'a', name: 'Ana', email: 'ana@ibm.com', role: 'recruiter' };

function useHarness(): { logout: ReturnType<typeof useLogoutMutation>; path: string } {
  return { logout: useLogoutMutation(), path: useLocation().pathname };
}

function wrapper({ children }: { readonly children: ReactNode }): JSX.Element {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return (
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/dashboard']}>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe('useLogoutMutation', () => {
  beforeEach(() => {
    mockedLogout.mockReset();
    useAuthStore.getState().setAuth(USER, 'fake-session-value');
  });

  it('should call the backend with the reason before clearing the session', async () => {
    let tokenAtCall: string | null = null;
    mockedLogout.mockImplementation(() => { tokenAtCall = useAuthStore.getState().token; return Promise.resolve(); });
    const { result } = renderHook(useHarness, { wrapper });

    act(() => { result.current.logout.mutate('manual'); });

    await waitFor(() => expect(useAuthStore.getState().token).toBeNull());
    expect(mockedLogout).toHaveBeenCalledWith('manual');
    expect(tokenAtCall).toBe('fake-session-value');
    expect(result.current.path).toBe('/login');
  });

  it('should still clear the session and redirect when the backend call fails', async () => {
    mockedLogout.mockRejectedValue(new HttpError(0, 'Failed to fetch'));
    const { result } = renderHook(useHarness, { wrapper });

    act(() => { result.current.logout.mutate('idle'); });

    await waitFor(() => expect(useAuthStore.getState().token).toBeNull());
    expect(mockedLogout).toHaveBeenCalledWith('idle');
    expect(result.current.path).toBe('/login');
  });
});
