import { useEffect, type RefObject } from 'react';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Elemento al que saltar (null = ninguno enfocable) o undefined si el navegador puede seguir su curso. */
function nextTarget(root: HTMLElement, backwards: boolean): HTMLElement | null | undefined {
  const items = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE));
  if (items.length === 0) return null;
  const active = document.activeElement;
  const outside = !root.contains(active) || active === root;
  const edge = backwards ? items[0] : items[items.length - 1];
  if (!outside && active !== edge) return undefined;
  return backwards ? items[items.length - 1] : items[0];
}

/**
 * Atrapa Tab/Shift+Tab dentro de `ref`. Recalcula los enfocables en cada Tab
 * (el contenido puede cambiar) y cede el control si hay un `[role="alertdialog"]` anidado.
 */
export function useFocusTrap(ref: RefObject<HTMLElement>): void {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      const root = ref.current;
      if (event.key !== 'Tab' || !root || root.querySelector('[role="alertdialog"]')) return;
      const target = nextTarget(root, event.shiftKey);
      if (target !== undefined) { event.preventDefault(); target?.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [ref]);
}
