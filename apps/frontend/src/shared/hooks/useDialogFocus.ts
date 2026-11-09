import { useEffect, useRef, type RefObject } from 'react';

/** Destino del foco al cerrar: un elemento o una función que lo resuelve en el momento de cerrar. */
export type TReturnFocusTo = HTMLElement | (() => HTMLElement | null);

/**
 * Mueve el foco al diálogo al montarse, cierra con Escape y, al desmontarse,
 * devuelve el foco a `returnFocusTo`; sin él, al elemento que tenía el foco al abrir.
 * No actúa ante Escape si hay un `[role="alertdialog"]` anidado (gestiona el suyo).
 */
export function useDialogFocus(
  ref: RefObject<HTMLElement>,
  returnFocusTo: TReturnFocusTo | undefined,
  onClose: () => void,
): void {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const returnRef = useRef(returnFocusTo);
  returnRef.current = returnFocusTo;

  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    ref.current?.focus();
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') return;
      if (ref.current?.querySelector('[role="alertdialog"]')) return;
      closeRef.current();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      const target = returnRef.current;
      const el = typeof target === 'function' ? target() : target ?? opener;
      el?.focus();
    };
  }, [ref]);
}
