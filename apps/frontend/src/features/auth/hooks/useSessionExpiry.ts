import { useEffect } from 'react';
import { useAuthStore } from '../store/auth.store';
import { getTokenExpiryMs, isTokenExpired } from '../utils/tokenExpiry';

// Máximo delay que acepta setTimeout (entero de 32 bits con signo).
export const MAX_TIMEOUT_MS = 2 ** 31 - 1;

/**
 * Cierra la sesión cuando el JWT vence: de inmediato si ya venció al montar,
 * o con un timer hasta `exp` si la pantalla queda abierta e inactiva.
 */
export function useSessionExpiry(token: string | null): void {
  const clearAuth = useAuthStore(state => state.clearAuth);

  useEffect(() => {
    if (!token) return undefined;

    let timer: ReturnType<typeof setTimeout> | undefined;

    const check = (): void => {
      if (isTokenExpired(token)) {
        clearAuth();
        return;
      }
      const expiryMs = getTokenExpiryMs(token) ?? 0;
      const delay = Math.min(Math.max(expiryMs - Date.now(), 0), MAX_TIMEOUT_MS);
      timer = setTimeout(check, delay);
    };

    check();
    return () => {
      if (timer !== undefined) clearTimeout(timer);
    };
  }, [token, clearAuth]);
}
