/** `enabled: false` = variable ausente o inválida (falla cerrado: el endpoint responde `AI_UNAVAILABLE`). */
export type TOpportunityDraftConfig =
  | { readonly enabled: false }
  | { readonly enabled: true; readonly maxTextChars: number; readonly timeoutMs: number };
