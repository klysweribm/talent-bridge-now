import type { ReactNode } from 'react';
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
  /** Cabecera y datos de la oportunidad: ocupan la columna principal, encima de equipo y candidatos. */
  readonly children?: ReactNode;
}

function SidePanels({ process }: ProcessActionsProps): JSX.Element {
  const permissions = useProcessPermissions(process);
  const limits = useProcessLimits();
  const terminal = limits.data?.terminalStatuses.includes(process.status) ?? false;
  return (
    <aside className="empty:hidden lg:sticky lg:top-lg flex flex-col gap-base bg-white border border-carbon-gray-20 p-lg">
      {limits.isError && <ErrorBanner message={PROCESS_ACTIONS_COPY.limitsError} actionLabel={PROCESS_ACTIONS_COPY.limitsRetry} onAction={() => { void limits.refetch(); }} />}
      {permissions.canEdit && <ProcessEditPanel process={process} />}
      {permissions.canChangeStatus && <ProcessStatusPanel process={process} />}
      {permissions.canChangeRecruiter && <ProcessRecruiterPanel process={process} />}
      {terminal && <p className="text-body text-carbon-gray-70">{PROCESS_ACTIONS_COPY.readOnlyTerminal}</p>}
    </aside>
  );
}

/** Acciones del detalle según los permisos del usuario; la UI solo oculta, la autoridad es el backend. */
export function ProcessActions({ process, children }: ProcessActionsProps): JSX.Element {
  const permissions = useProcessPermissions(process);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(280px,320px)] gap-lg items-start">
      <div className="flex flex-col gap-lg min-w-0">
        {children}
        <ProcessTechnicalTeamPanel process={process} canEdit={permissions.canEdit} />
        <ProcessCandidatesPanel process={process} canManage={permissions.canManageCandidates} />
      </div>
      <SidePanels process={process} />
    </div>
  );
}
