import type { IProcessListTechnicalRef } from '@ibm-talent-bridge/shared-types';
import { AvatarGroup } from '@shared/components/molecules/AvatarGroup/AvatarGroup';
import { PROCESS_LIST_COPY, REFERENTS_AVATAR_MAX } from '../../../config/processList.constants';
import { abbreviateName, joinNames } from '../../../utils/abbreviateName';

export interface ProcessReferentsProps {
  readonly referents: readonly IProcessListTechnicalRef[];
}

export function ProcessReferents({ referents }: ProcessReferentsProps): JSX.Element {
  if (referents.length === 0) {
    return <span className="text-body-md text-text-secondary">{PROCESS_LIST_COPY.noReferents}</span>;
  }
  const avatars = referents.map(r => ({ name: r.fullName, imageUrl: r.avatarUrl }));
  return (
    <span className="inline-flex items-center gap-sm min-w-0">
      <span className="text-body-md text-text-secondary">{PROCESS_LIST_COPY.referentsLabel}</span>
      <AvatarGroup avatars={avatars} max={REFERENTS_AVATAR_MAX} label={PROCESS_LIST_COPY.referentsGroup} />
      <span className="text-body-md text-text-primary truncate">{joinNames(referents.map(r => abbreviateName(r.fullName)))}</span>
    </span>
  );
}
