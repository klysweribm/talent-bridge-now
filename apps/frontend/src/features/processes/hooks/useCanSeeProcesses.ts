import { useAuthStore } from '../../auth/store/auth.store';

/** technical_ref no tiene acceso a GET /processes (403). */
export function useCanSeeProcesses(): boolean {
  return useAuthStore(state => state.user?.role) !== 'technical_ref';
}
