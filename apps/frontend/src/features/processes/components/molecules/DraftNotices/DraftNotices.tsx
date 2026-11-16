import { DRAFT_COPY } from '../../../config/opportunityDraft.copy';
import type { TDraftField } from '../../../utils/applyOpportunityDraft';

export interface DraftNoticesProps {
  readonly applied:  boolean;
  readonly missing:  readonly TDraftField[];
  readonly skipped:  readonly TDraftField[];
  readonly warnings: readonly string[];
}

const labels = (fields: readonly TDraftField[]): readonly string[] => fields.map(field => DRAFT_COPY.fieldLabels[field]);

/** Aviso (aria-live) tras generar: qué falta, qué no se sobrescribió y los warnings del backend tal cual. */
export function DraftNotices({ applied, missing, skipped, warnings }: DraftNoticesProps): JSX.Element | null {
  if (!applied && missing.length === 0 && skipped.length === 0 && warnings.length === 0) return null;
  return (
    <div role="status" aria-label={DRAFT_COPY.noticesLabel} className="flex flex-col gap-sm border-l-[3px] border-carbon-yellow bg-carbon-yellow-tag-bg ring-1 ring-inset ring-carbon-yellow-ring px-base py-[14px] text-body text-carbon-gray-100">
      {applied && <p>{DRAFT_COPY.appliedNotice}</p>}
      {missing.length > 0 && <p><strong>{DRAFT_COPY.missingNotice(labels(missing))}</strong></p>}
      {skipped.length > 0 && <p>{DRAFT_COPY.skippedNotice(labels(skipped))}</p>}
      {warnings.length > 0 && <ul className="list-disc pl-lg">{warnings.map(warning => <li key={warning}>{warning}</li>)}</ul>}
    </div>
  );
}
