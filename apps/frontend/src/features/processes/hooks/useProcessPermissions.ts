import type { IProcessDetail } from '@ibm-talent-bridge/shared-types';
import { useAuthStore } from '@features/auth/store/auth.store';
import { useProcessLimits } from './useProcessLimits';

export interface IProcessPermissions {
  readonly canEdit:             boolean;
  readonly canChangeStatus:     boolean;
  readonly canManageCandidates: boolean;
  readonly canChangeRecruiter:  boolean;
}

const NONE: IProcessPermissions = { canEdit: false, canChangeStatus: false, canManageCandidates: false, canChangeRecruiter: false };

/**
 * Solo oculta/deshabilita la UI; la autoridad es el backend (muestra su error si responde 403/400).
 * Los estados terminales vienen de `GET /processes/limits`: mientras no se conocen (cargando, error o sin acceso) no se
 * habilita ninguna acción (falla cerrado), para no ofrecer acciones sobre un proceso que podría estar cerrado.
 */
export function useProcessPermissions(process: Pick<IProcessDetail, 'ownerPmId' | 'recruiterId' | 'status'>): IProcessPermissions {
  const userId = useAuthStore(state => state.user?.id);
  const terminalStatuses = useProcessLimits().data?.terminalStatuses;
  if (!userId || !terminalStatuses || terminalStatuses.includes(process.status)) return NONE;
  const isOwner = process.ownerPmId === userId;
  const isRecruiter = process.recruiterId === userId;
  if (!isOwner && !isRecruiter) return NONE;
  return { canEdit: true, canChangeStatus: true, canManageCandidates: true, canChangeRecruiter: isOwner };
}
