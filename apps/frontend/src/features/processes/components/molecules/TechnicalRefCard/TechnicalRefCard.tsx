import type { IProcessTechnicalRef } from '@ibm-talent-bridge/shared-types';
import { Avatar } from '@shared/components/atoms/Avatar/Avatar';
import { TECHNICAL_TEAM_COPY as COPY } from '../../../config/technicalTeam.copy';

export interface TechnicalRefCardProps {
  readonly technicalRef: IProcessTechnicalRef;
}

const CHIP = 'inline-flex items-center h-6 px-sm rounded-pill text-label whitespace-nowrap';

/** Ficha de un referente técnico: sin `description` o `band` esas partes se omiten (nunca «null»). */
export function TechnicalRefCard({ technicalRef: { fullName, description, email, band, status, avatarUrl } }: TechnicalRefCardProps): JSX.Element {
  return (
    <div className="flex items-start gap-md p-base border border-carbon-gray-20 bg-white">
      <Avatar name={fullName} imageUrl={avatarUrl} size="lg" className="flex-shrink-0" />
      <div className="flex flex-col min-w-0 flex-1 gap-2xs">
        <p className="text-body font-semibold text-carbon-gray-100 break-words">{fullName}</p>
        {description !== '' && <p className="text-label text-carbon-gray-70 break-words">{description}</p>}
        <p className="text-label text-carbon-gray-70 break-all">{email}</p>
        {status === 'inactive' && <span className={`${CHIP} self-start bg-carbon-yellow-tag-bg text-carbon-yellow-tag-text`}>{COPY.inactive}</span>}
      </div>
      {band !== null && <span className={`${CHIP} bg-carbon-blue-20 text-carbon-blue-80`}>{COPY.band(band)}</span>}
    </div>
  );
}
