import type { ICandidateMatches } from '@ibm-talent-bridge/shared-types';
import { MATCH_COPY, MATCH_REASON_LABELS } from '../../../config/candidates.constants';
import { AuditSummary } from '../../atoms/AuditSummary';

export interface CandidateMatchNoticeProps {
  readonly matches: ICandidateMatches;
}

/** Aviso no bloqueante: perfil exacto (se actualizará) y perfiles parecidos (solo informativo). */
export function CandidateMatchNotice({ matches }: CandidateMatchNoticeProps): JSX.Element | null {
  const { exact, similar } = matches;
  if (!exact && similar.length === 0) return null;
  return (
    <div className="flex flex-col gap-sm">
      {exact && (
        <div role="status" className="flex flex-col gap-xs p-md rounded border border-status-warning bg-status-warning-bg">
          <p className="text-body-md-medium text-text-primary">{MATCH_COPY.exactTitle}</p>
          <p className="text-body-md text-text-primary">{exact.fullName} · {exact.email}</p>
          <AuditSummary updatedAt={exact.updatedAt} updatedBy={exact.updatedBy} updateCount={exact.updateCount} />
          <p className="text-body-md text-text-primary">{MATCH_COPY.exactReplace}</p>
        </div>
      )}
      {similar.length > 0 && (
        <section aria-labelledby="similar-profiles-title" className="flex flex-col gap-xs p-md rounded border border-outline-variant bg-surface-card">
          <h3 id="similar-profiles-title" className="text-body-md-medium text-text-primary">{MATCH_COPY.similarTitle}</h3>
          <ul className="list-disc pl-lg text-body-md text-text-primary">
            {similar.map(match => (
              <li key={match.id}>{match.fullName} · {match.email} · {MATCH_REASON_LABELS[match.reason]}</li>
            ))}
          </ul>
          <p className="text-body-md text-text-secondary">{MATCH_COPY.similarNonBlocking}</p>
        </section>
      )}
    </div>
  );
}
