import { useRef, useState } from 'react';
import type { IUseProcessDataForm } from './useProcessDataForm';
import { OpportunityDraftFailure } from '../infrastructure/opportunityDraft.errors';
import { DRAFT_COPY } from '../config/opportunityDraft.copy';
import { applyOpportunityDraft, type IAppliedDraft, type IDraftCurrent } from '../utils/applyOpportunityDraft';
import { deriveDraftMarks, type TDraftMarks } from '../utils/draftMarks';
import { useGenerateOpportunityDraft } from './useGenerateOpportunityDraft';

export interface IOpportunityDraftView {
  readonly text:        string;
  readonly setText:     (text: string) => void;
  readonly generate:    () => void;
  readonly isPending:   boolean;
  readonly error?:      string;
  readonly marks:       TDraftMarks;
  readonly result?:     IAppliedDraft;
  readonly warnings:    readonly string[];
}

/** Estado LOCAL del borrador (texto, resultado, avisos): nada de esto va a Zustand ni al storage del navegador. */
export function useOpportunityDraft(form: IUseProcessDataForm): IOpportunityDraftView {
  const [text, setText] = useState('');
  const [state, setState] = useState<{ result: IAppliedDraft; warnings: readonly string[] }>();
  const mutation = useGenerateOpportunityDraft();
  const current: IDraftCurrent = { ...form.values, ...form.opportunity.values };
  const latest = useRef(current);
  latest.current = current; // al responder se lee el valor de ese momento, no el del clic: así no se pisa lo tecleado mientras se espera.

  const generate = (): void => {
    mutation.mutate(text.trim(), {
      onSuccess: response => {
        const result = applyOpportunityDraft(response.draft, response.missingFields, latest.current);
        Object.entries(result.patch).forEach(([name, value]) => form.setValue(name as never, value as never, { shouldValidate: true }));
        setState({ result, warnings: response.warnings });
      },
    });
  };
  const { error } = mutation;
  return {
    text, setText, generate, isPending: mutation.isPending,
    ...(error && { error: error instanceof OpportunityDraftFailure ? error.message : DRAFT_COPY.errors.UNKNOWN }),
    marks: deriveDraftMarks(state?.result, current), warnings: state?.warnings ?? [],
    ...(state && { result: state.result }),
  };
}
