import type { ICandidateMatches } from '@ibm-talent-bridge/shared-types';
import { InlineNotification } from '@shared/components/molecules/InlineNotification';
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
        <InlineNotification kind="warning" role="status">
          <div className="flex flex-col gap-xs">
            <p className="font-semibold">{MATCH_COPY.exactTitle}</p>
            <p>{exact.fullName} · {exact.email}</p>
            <AuditSummary updatedAt={exact.updatedAt} updatedBy={exact.updatedBy} updateCount={exact.updateCount} />
            <p>{MATCH_COPY.exactReplace}</p>
          </div>
        </InlineNotification>
      )}
      {similar.length > 0 && (
        <section aria-labelledby="similar-profiles-title" className="flex flex-col gap-xs p-base bg-white">
          <h3 id="similar-profiles-title" className="font-semibold text-body text-carbon-gray-100">{MATCH_COPY.similarTitle}</h3>
          <ul className="list-disc pl-lg text-body text-carbon-gray-100">
            {similar.map(match => (
              <li key={match.id}>{match.fullName} · {match.email} · {MATCH_REASON_LABELS[match.reason]}</li>
            ))}
          </ul>
          <p className="text-body text-carbon-gray-70">{MATCH_COPY.similarNonBlocking}</p>
        </section>
      )}
    </div>
  );
}
