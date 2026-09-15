import { create } from 'zustand';

export type UserRole = 'recruiter' | 'technical' | 'pm';

export interface AuthUser {
  readonly id:    string;
  readonly name:  string;
  readonly email: string;
  readonly role:  UserRole;
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

export const useAuthStore = create<AuthState & AuthActions>()((set) => ({
  ...INITIAL_STATE,

  setAuth: (user, token) =>
    set(() => ({ user, token })),

  clearAuth: () =>
    set(() => ({ ...INITIAL_STATE })),
}));
