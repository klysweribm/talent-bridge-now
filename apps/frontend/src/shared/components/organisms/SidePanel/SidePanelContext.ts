import { createContext, useContext } from 'react';

export interface ISidePanelApi {
  /** Cierra el panel saltando `guardClose` (p. ej. el botón «Descartar» de una confirmación). */
  readonly forceClose: () => void;
}

export const SidePanelContext = createContext<ISidePanelApi | null>(null);

/** Acceso de los hijos del `SidePanel` a `forceClose`. Solo válido dentro de un `SidePanel`. */
export function useSidePanel(): ISidePanelApi {
  const api = useContext(SidePanelContext);
  if (!api) throw new Error('useSidePanel must be used within a SidePanel');
  return api;
}
