import type { IOpportunityDraftView } from '../../../hooks/useOpportunityDraft';
import { BrochureDropzone } from '../BrochureDropzone/BrochureDropzone';
import { DraftErrorAlert } from '../DraftErrorAlert/DraftErrorAlert';
import { DraftNotices } from '../DraftNotices/DraftNotices';
import { OpportunityDraftBox } from '../OpportunityDraftBox/OpportunityDraftBox';

export interface OpportunityDraftPanelProps {
  readonly draft: IOpportunityDraftView;
}

/** Box de texto libre, brochure + error + avisos del borrador de IA. Solo compone; el estado vive en `useOpportunityDraft`. */
export function OpportunityDraftPanel({ draft }: OpportunityDraftPanelProps): JSX.Element {
  const { result } = draft;
  return (
    <>
      <OpportunityDraftBox text={draft.text} isPending={draft.isPending} onText={draft.setText} onGenerate={draft.generate} />
      <BrochureDropzone onSelect={draft.uploadFile} disabled={draft.isPending} />
      {draft.error && <DraftErrorAlert message={draft.error} {...(draft.canRetry && { onRetry: draft.generate })} />}
      <DraftNotices applied={Boolean(result?.applied.length)} missing={result?.missing ?? []} skipped={result?.skipped ?? []} warnings={draft.warnings} />
    </>
  );
}
