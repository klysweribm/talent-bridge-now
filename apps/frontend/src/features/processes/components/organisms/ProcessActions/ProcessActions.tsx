import type { IProcessDetail } from '@ibm-talent-bridge/shared-types';
import { PROCESS_ACTIONS_COPY } from '../../../config/processActions.copy';
import { useProcessLimits } from '../../../hooks/useProcessLimits';
import { useProcessPermissions } from '../../../hooks/useProcessPermissions';
import { ErrorBanner } from '../../molecules/ErrorBanner';
import { ProcessCandidatesPanel } from '../ProcessCandidatesPanel/ProcessCandidatesPanel';
import { ProcessEditPanel } from '../ProcessEditPanel/ProcessEditPanel';
import { ProcessRecruiterPanel } from '../ProcessRecruiterPanel/ProcessRecruiterPanel';
import { ProcessStatusPanel } from '../ProcessStatusPanel/ProcessStatusPanel';
import { ProcessTechnicalTeamPanel } from '../ProcessTechnicalTeamPanel/ProcessTechnicalTeamPanel';

export interface ProcessActionsProps {
  readonly process: IProcessDetail;
}

/** Acciones del detalle según los permisos del usuario; la UI solo oculta, la autoridad es el backend. */
export function ProcessActions({ process }: ProcessActionsProps): JSX.Element {
  const permissions = useProcessPermissions(process);
  const limits = useProcessLimits();
  return (
    <>
      {limits.isError && <ErrorBanner message={PROCESS_ACTIONS_COPY.limitsError} actionLabel={PROCESS_ACTIONS_COPY.limitsRetry} onAction={() => { void limits.refetch(); }} />}
      {permissions.canEdit && <ProcessEditPanel process={process} />}
      {permissions.canChangeStatus && <ProcessStatusPanel process={process} />}
      {permissions.canChangeRecruiter && <ProcessRecruiterPanel process={process} />}
      {limits.data?.terminalStatuses.includes(process.status) && <p className="text-body-md text-text-secondary">{PROCESS_ACTIONS_COPY.readOnlyTerminal}</p>}
      <ProcessTechnicalTeamPanel process={process} canEdit={permissions.canEdit} />
      <ProcessCandidatesPanel process={process} canManage={permissions.canManageCandidates} />
    </>
  );
}
