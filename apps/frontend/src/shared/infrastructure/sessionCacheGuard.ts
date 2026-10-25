import type { QueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@features/auth/store/auth.store';

/**
 * Vacía la caché de React Query cuando la sesión termina (token presente →
 * ausente) o cambia de usuario (A → B sin logout intermedio). Cuelga del
 * store, no de cada llamador, para que ningún dato de A llegue a B.
 */
export function installSessionCacheGuard(client: QueryClient): () => void {
  return useAuthStore.subscribe((state, prev) => {
    const sessionEnded = Boolean(prev.token) && !state.token;
    const userChanged =
      prev.user !== null && state.user !== null && prev.user.id !== state.user.id;
    if (!sessionEnded && !userChanged) return;
    void client.cancelQueries();
    client.clear();
  });
}
