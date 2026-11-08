import type { IOpportunityDraftView } from '../../../hooks/useOpportunityDraft';
import { DraftErrorAlert } from '../DraftErrorAlert/DraftErrorAlert';
import { DraftNotices } from '../DraftNotices/DraftNotices';
import { OpportunityDraftBox } from '../OpportunityDraftBox/OpportunityDraftBox';

export interface OpportunityDraftPanelProps {
  readonly draft: IOpportunityDraftView;
}

/** Box de texto libre + error + avisos del borrador de IA. Solo compone; el estado vive en `useOpportunityDraft`. */
export function OpportunityDraftPanel({ draft }: OpportunityDraftPanelProps): JSX.Element {
  const { result } = draft;
  return (
    <>
      <OpportunityDraftBox text={draft.text} isPending={draft.isPending} onText={draft.setText} onGenerate={draft.generate} />
      {draft.error && <DraftErrorAlert message={draft.error} onRetry={draft.generate} />}
      <DraftNotices applied={Boolean(result?.applied.length)} missing={result?.missing ?? []} skipped={result?.skipped ?? []} warnings={draft.warnings} />
    </>
  );
}
