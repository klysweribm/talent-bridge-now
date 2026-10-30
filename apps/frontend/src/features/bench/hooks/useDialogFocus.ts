import { useEffect, useRef, type RefObject } from 'react';

/**
 * Mueve el foco al diálogo al montarse, cierra con Escape y, al desmontarse,
 * devuelve el foco a `returnSelector` (la fila que lo abrió).
 */
export function useDialogFocus(
  ref: RefObject<HTMLElement>,
  returnSelector: string,
  onClose: () => void,
): void {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    ref.current?.focus();
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') closeRef.current();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.querySelector<HTMLElement>(returnSelector)?.focus();
    };
  }, [ref, returnSelector]);
}
