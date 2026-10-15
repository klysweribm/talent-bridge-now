import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User as ISharedUser, UserRole } from '@ibm-talent-bridge/shared-types';

export type { UserRole };

/**
 * AuthUser — usuario de la sesión frontend. Reutiliza `id`/`email`/`role` de
 * `User` (`packages/shared-types`) como única fuente de verdad del dominio;
 * `name` es un campo de conveniencia solo-UI (display name), distinto del
 * `fullName` del tipo compartido.
 */
export interface AuthUser extends Pick<ISharedUser, 'id' | 'email' | 'role'> {
  readonly name: string;
}

interface AuthState {
  readonly user:  AuthUser | null;
  readonly token: string | null;
}

interface AuthActions {
  setAuth:   (user: AuthUser, token: string) => void;
  clearAuth: () => void;
}

const INITIAL_STATE: AuthState = {
  user:  null,
  token: null,
} as const;

// Persistencia en sessionStorage: la sesión sobrevive a F5 pero no a cerrar
// la pestaña/navegador (requisito de demo QW-1, sin introducir un storage
// de servidor todavía — ver AUTH-1 para JWT real).
export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      ...INITIAL_STATE,

      setAuth: (user, token) =>
        set(() => ({ user, token })),

      clearAuth: () =>
        set(() => ({ ...INITIAL_STATE })),
    }),
    {
      name:    'ibm-talent-bridge-auth',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ user: state.user, token: state.token }),
    },
  ),
);
