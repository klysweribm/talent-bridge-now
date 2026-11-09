import { useEffect, useRef } from 'react';

export interface ICandidateCreateFormState {
  /** Extracción o guardado en curso. */
  readonly busy: boolean;
  /** Hay trabajo del usuario que se perdería al cerrar. */
  readonly dirty: boolean;
  /** Solo presente (true) mientras el guardado está pendiente; distingue guardar de extraer. */
  readonly saving?: true;
}

/** Notifica `{ busy, dirty[, saving] }` solo cuando cambian; no notifica al desmontar. */
export function useReportFormState(busy: boolean, dirty: boolean, onStateChange?: (state: ICandidateCreateFormState) => void, saving = false): void {
  const callback = useRef(onStateChange);
  callback.current = onStateChange;
  useEffect(() => { callback.current?.(saving ? { busy, dirty, saving: true } : { busy, dirty }); }, [busy, dirty, saving]);
}
