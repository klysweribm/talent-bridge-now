import type { IProcessDetail } from '@ibm-talent-bridge/shared-types';
import { TERMINAL_PROCESS_STATUSES } from '@/config/processStatus';
import { useAuthStore } from '@features/auth/store/auth.store';

export interface IProcessPermissions {
  readonly canEdit:             boolean;
  readonly canChangeStatus:     boolean;
  readonly canManageCandidates: boolean;
  readonly canChangeRecruiter:  boolean;
}

const NONE: IProcessPermissions = { canEdit: false, canChangeStatus: false, canManageCandidates: false, canChangeRecruiter: false };

/** Solo oculta/deshabilita la UI; la autoridad es el backend (muestra su error si responde 403/400). */
export function useProcessPermissions(process: Pick<IProcessDetail, 'ownerPmId' | 'recruiterId' | 'status'>): IProcessPermissions {
  const userId = useAuthStore(state => state.user?.id);
  if (!userId || TERMINAL_PROCESS_STATUSES.includes(process.status)) return NONE;
  const isOwner = process.ownerPmId === userId;
  const isRecruiter = process.recruiterId === userId;
  if (!isOwner && !isRecruiter) return NONE;
  return { canEdit: true, canChangeStatus: true, canManageCandidates: true, canChangeRecruiter: isOwner };
}
