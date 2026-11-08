import { Button } from '@shared/components/atoms/Button';
import { DRAFT_COPY } from '../../../config/opportunityDraft.copy';
import { TextAreaField } from '../../atoms/TextAreaField/TextAreaField';

export interface OpportunityDraftBoxProps {
  readonly text:      string;
  readonly isPending: boolean;
  readonly onText:    (text: string) => void;
  readonly onGenerate: () => void;
}

const BOX_ID = 'process-draft-text';

/** Texto libre + «Generar con IA». Presentacional: no sabe de red ni de formulario. */
export function OpportunityDraftBox({ text, isPending, onText, onGenerate }: OpportunityDraftBoxProps): JSX.Element {
  return (
    <section className="flex flex-col items-start gap-sm rounded border border-outline-field p-md">
      <TextAreaField
        id={BOX_ID} label={DRAFT_COPY.boxLabel} hint={DRAFT_COPY.boxHint} placeholder={DRAFT_COPY.boxPlaceholder}
        value={text} onChange={event => onText(event.target.value)} readOnly={isPending}
      />
      <Button
        type="button" variant="secondary" className="min-h-11"
        disabled={text.trim() === ''} loading={isPending} onClick={onGenerate}
      >
        {isPending ? DRAFT_COPY.generating : DRAFT_COPY.generate}
      </Button>
    </section>
  );
}
