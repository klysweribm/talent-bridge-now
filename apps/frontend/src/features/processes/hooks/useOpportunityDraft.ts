import { useRef, useState } from 'react';
import type { IOpportunityDraftResponse } from '@ibm-talent-bridge/shared-types';
import type { IUseProcessDataForm } from './useProcessDataForm';
import { applyOpportunityDraft, type IAppliedDraft, type IDraftCurrent } from '../utils/applyOpportunityDraft';
import { deriveDraftMarks, type TDraftMarks } from '../utils/draftMarks';
import { useDraftFileUpload } from './useDraftFileUpload';
import { deriveDraftError } from './useDraftError';
import { useGenerateOpportunityDraft } from './useGenerateOpportunityDraft';
import { useGenerateOpportunityDraftFromFile } from './useGenerateOpportunityDraftFromFile';

export interface IOpportunityDraftView {
  readonly text:        string;
  readonly setText:     (text: string) => void;
  readonly generate:    () => void;
  readonly uploadFile:  (file: File | undefined) => void;
  readonly isPending:   boolean;
  readonly error?:      string;
  readonly canRetry:    boolean;
  readonly marks:       TDraftMarks;
  readonly result?:     IAppliedDraft;
  readonly warnings:    readonly string[];
}

/** Estado LOCAL del borrador (texto, resultado, avisos): nada de esto va a Zustand ni al storage del navegador. El archivo no se retiene. */
export function useOpportunityDraft(form: IUseProcessDataForm): IOpportunityDraftView {
  const [text, setText] = useState('');
  const [state, setState] = useState<{ result: IAppliedDraft; warnings: readonly string[] }>();
  const textMutation = useGenerateOpportunityDraft();
  const fileMutation = useGenerateOpportunityDraftFromFile();
  const current: IDraftCurrent = { ...form.values, ...form.opportunity.values };
  const latest = useRef(current);
  latest.current = current; // al responder se lee el valor de ese momento, no el del clic: así no se pisa lo tecleado mientras se espera.

  // Camino común de aplicación para texto y archivo.
  const onSuccess = (response: IOpportunityDraftResponse): void => {
    const result = applyOpportunityDraft(response.draft, response.missingFields, latest.current);
    Object.entries(result.patch).forEach(([name, value]) => form.setValue(name as never, value as never, { shouldValidate: true }));
    setState({ result, warnings: response.warnings });
  };
  const upload = useDraftFileUpload(fileMutation, onSuccess, () => textMutation.reset());
  const generate = (): void => {
    upload.clearFileError();
    fileMutation.reset();
    textMutation.mutate(text.trim(), { onSuccess });
  };
  return {
    text, setText, generate, uploadFile: upload.uploadFile, isPending: textMutation.isPending || fileMutation.isPending,
    ...deriveDraftError(upload.localFileError, fileMutation.error, textMutation.error),
    marks: deriveDraftMarks(state?.result, current), warnings: state?.warnings ?? [],
    ...(state && { result: state.result }),
  };
}
