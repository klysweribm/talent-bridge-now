import type { ICandidateActor } from '@ibm-talent-bridge/shared-types';
import { ROLE_LABELS } from '@/config/design-tokens';
import { AUDIT_COPY, AUDIT_LOCALE } from '../config/candidates.constants';

export function formatUpdatedAt(iso: string): string {
  return new Date(iso).toLocaleDateString(AUDIT_LOCALE);
}

/** "ana@ibm.com (Reclutador)". */
export function describeActor(actor: ICandidateActor): string {
  return `${actor.email} (${ROLE_LABELS[actor.role]})`;
}

export function describeUpdateCount(count: number): string {
  if (count <= 0) return AUDIT_COPY.neverUpdated;
  return count === 1 ? AUDIT_COPY.updatedOnce : `${AUDIT_COPY.updatedMany} ${count} ${AUDIT_COPY.times}`;
}
