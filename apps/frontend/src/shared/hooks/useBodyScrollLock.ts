import { useEffect } from 'react';

/** Bloquea el scroll del body mientras el componente está montado y restaura el valor previo exacto. */
export function useBodyScrollLock(): void {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, []);
}
