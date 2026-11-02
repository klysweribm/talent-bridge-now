import type { IProcessDetail } from '@ibm-talent-bridge/shared-types';
import { TERMINAL_PROCESS_STATUSES } from '@/config/processStatus';
import { PROCESS_ACTIONS_COPY } from '../../../config/processActions.copy';
import { useProcessPermissions } from '../../../hooks/useProcessPermissions';
import { ProcessCandidatesPanel } from '../ProcessCandidatesPanel/ProcessCandidatesPanel';
import { ProcessEditPanel } from '../ProcessEditPanel/ProcessEditPanel';
import { ProcessRecruiterPanel } from '../ProcessRecruiterPanel/ProcessRecruiterPanel';
import { ProcessStatusPanel } from '../ProcessStatusPanel/ProcessStatusPanel';

export interface ProcessActionsProps {
  readonly process: IProcessDetail;
}

/** Acciones del detalle según los permisos del usuario; la UI solo oculta, la autoridad es el backend. */
export function ProcessActions({ process }: ProcessActionsProps): JSX.Element {
  const permissions = useProcessPermissions(process);
  return (
    <>
      {permissions.canEdit && <ProcessEditPanel process={process} />}
      {permissions.canChangeStatus && <ProcessStatusPanel process={process} />}
      {permissions.canChangeRecruiter && <ProcessRecruiterPanel process={process} />}
      {TERMINAL_PROCESS_STATUSES.includes(process.status) && <p className="text-body-md text-text-secondary">{PROCESS_ACTIONS_COPY.readOnlyTerminal}</p>}
      <ProcessCandidatesPanel process={process} canManage={permissions.canManageCandidates} />
    </>
  );
}
