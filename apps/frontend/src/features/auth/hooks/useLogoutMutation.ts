import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@features/auth/store/auth.store';
import { logoutUser, type TLogoutReason } from '@features/auth/infrastructure/auth.infra';

/**
 * Cierra la sesión avisando primero al backend (auditoría). Éxito o fallo
 * (red, 401), la sesión local se limpia igual y se redirige a /login: la
 * salida nunca queda bloqueada. El vaciado de la caché de React Query lo
 * hace el guard de sesión al cambiar el store (DT-015).
 */
export function useLogoutMutation(): UseMutationResult<void, Error, TLogoutReason> {
  const clearAuth = useAuthStore(state => state.clearAuth);
  const navigate = useNavigate();

  return useMutation<void, Error, TLogoutReason>({
    mutationFn: (reason: TLogoutReason) => logoutUser(reason),
    onSettled: () => {
      clearAuth();
      navigate('/login', { replace: true });
    },
  });
}
