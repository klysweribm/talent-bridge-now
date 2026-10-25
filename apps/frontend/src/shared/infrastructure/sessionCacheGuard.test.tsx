import { act, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { useAuthStore, type AuthUser } from '@features/auth/store/auth.store';
import { httpClient } from './httpClient';
import { installSessionCacheGuard } from './sessionCacheGuard';

const USER_A: AuthUser = { id: 'a', name: 'Ana', email: 'ana@ibm.com', role: 'recruiter' };
const USER_B: AuthUser = { id: 'b', name: 'Carlos', email: 'carlos@ibm.com', role: 'technical_ref' };
const QUERY_KEY = ['probe'] as const;

function login(user: AuthUser, token = `token-${user.id}`): void {
  act(() => { useAuthStore.getState().setAuth(user, token); });
}

function logout(): void {
  act(() => { useAuthStore.getState().clearAuth(); });
}

function seedCache(client: QueryClient): void {
  client.setQueryData(QUERY_KEY, 'cached');
}

function ProbeOrganism({ queryFn }: { readonly queryFn: () => Promise<string> }) {
  const { data } = useQuery({ queryKey: QUERY_KEY, queryFn });
  return <p data-testid="probe">{data ?? 'loading'}</p>;
}

// Como la app real: el árbol protegido se desmonta sin sesión y se monta al loguear.
function ProtectedProbe({ queryFn }: { readonly queryFn: () => Promise<string> }) {
  const token = useAuthStore((state) => state.token);
  return token ? <ProbeOrganism queryFn={queryFn} /> : null;
}

describe('sessionCacheGuard', () => {
  let client: QueryClient;
  let teardown: Array<() => void>;

  beforeEach(() => {
    useAuthStore.getState().clearAuth();
    client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } });
    teardown = [];
  });

  afterEach(() => {
    teardown.forEach((off) => off());
    vi.unstubAllGlobals();
  });

  const install = (): void => { teardown.push(installSessionCacheGuard(client)); };

  it('should empty the cache when the user logs out', () => {
    login(USER_A);
    install();
    seedCache(client);
    logout();
    expect(client.getQueryCache().getAll()).toHaveLength(0);
  });

  it('should empty the cache when httpClient receives a 401', async () => {
    login(USER_A);
    install();
    seedCache(client);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false, status: 401, text: () => Promise.resolve('{}'),
    }));
    await act(async () => { await httpClient.get('/processes').catch(() => undefined); });
    expect(useAuthStore.getState().token).toBeNull();
    expect(client.getQueryCache().getAll()).toHaveLength(0);
  });

  it('should empty the cache when the user switches from A to B without logout', () => {
    login(USER_A);
    install();
    seedCache(client);
    login(USER_B);
    expect(client.getQueryCache().getAll()).toHaveLength(0);
  });

  it('should keep the cache when setAuth repeats the same user and token', () => {
    login(USER_A, 'same-token');
    install();
    seedCache(client);
    login(USER_A, 'same-token');
    expect(client.getQueryData(QUERY_KEY)).toBe('cached');
  });

  it('should stop clearing the cache when the returned unsubscribe is called', () => {
    login(USER_A);
    const off = installSessionCacheGuard(client);
    off();
    seedCache(client);
    logout();
    expect(client.getQueryData(QUERY_KEY)).toBe('cached');
  });

  it('should leave no active listener when install is called twice and both are unsubscribed', () => {
    login(USER_A);
    const offFirst = installSessionCacheGuard(client);
    const offSecond = installSessionCacheGuard(client);
    offFirst();
    offSecond();
    seedCache(client);
    logout();
    expect(client.getQueryData(QUERY_KEY)).toBe('cached');
  });

  it('should refetch and never show user A data to user B when the session changes', async () => {
    install();
    const queryFn = vi.fn(() => Promise.resolve(`data of ${useAuthStore.getState().user?.name ?? 'nobody'}`));
    login(USER_A);
    render(
      <QueryClientProvider client={client}>
        <ProtectedProbe queryFn={queryFn} />
      </QueryClientProvider>,
    );
    expect(await screen.findByText('data of Ana')).toBeInTheDocument();
    expect(queryFn).toHaveBeenCalledTimes(1);

    logout();
    login(USER_B);

    expect(await screen.findByText('data of Carlos')).toBeInTheDocument();
    expect(queryFn).toHaveBeenCalledTimes(2);
    expect(screen.queryByText('data of Ana')).not.toBeInTheDocument();
  });
});
