import type { IProcessTechnicalRef } from '@ibm-talent-bridge/shared-types';
import { Avatar } from '@shared/components/atoms/Avatar/Avatar';
import { TECHNICAL_TEAM_COPY as COPY } from '../../../config/technicalTeam.copy';

export interface TechnicalRefCardProps {
  readonly technicalRef: IProcessTechnicalRef;
}

const CHIP = 'inline-flex items-center h-6 px-sm rounded text-label-md whitespace-nowrap';

/** Ficha de un referente técnico: sin `description` o `band` esas partes se omiten (nunca «null»). */
export function TechnicalRefCard({ technicalRef: { fullName, description, email, band, status, avatarUrl } }: TechnicalRefCardProps): JSX.Element {
  return (
    <div className="flex items-start gap-md p-base rounded-lg bg-surface-low">
      <Avatar name={fullName} imageUrl={avatarUrl} size="lg" className="flex-shrink-0" />
      <div className="flex flex-col min-w-0 flex-1 gap-2xs">
        <p className="text-body-md-medium font-bold text-text-primary break-words">{fullName}</p>
        {description !== '' && <p className="text-body-md text-text-secondary break-words">{description}</p>}
        <p className="text-label-md text-text-secondary break-all">{email}</p>
        {status === 'inactive' && <span className={`${CHIP} self-start bg-status-warning-bg text-text-primary`}>{COPY.inactive}</span>}
      </div>
      {band !== null && <span className={`${CHIP} bg-status-info-bg text-status-info-text`}>{COPY.band(band)}</span>}
    </div>
  );
}
