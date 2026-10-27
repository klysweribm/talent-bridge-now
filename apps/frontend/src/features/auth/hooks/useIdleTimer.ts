import { useCallback, useRef, useState } from 'react';
import { useIdleClock, type IIdleRefs } from './useIdleClock';
import { useLogoutMutation } from './useLogoutMutation';

export interface IIdleTimerState {
  /** Segundos restantes del aviso; `null` mientras el usuario está activo. */
  readonly secondsLeft: number | null;
  readonly stayConnected: () => void;
}

/**
 * Cierra la sesión por inactividad. Compara con `Date.now()` en cada tick (no
 * cuenta ticks: las pestañas en segundo plano frenan los timers). Antes del
 * aviso cualquier actividad reinicia el reloj; durante el aviso la actividad
 * se IGNORA a propósito (un roce del mouse no debe anular el aviso sin que el
 * usuario lo vea): solo `stayConnected()` lo cancela. A 0 → logout 'idle'.
 */
export function useIdleTimer(): IIdleTimerState {
  const { mutate: logout } = useLogoutMutation();
  const refs = useRef<IIdleRefs>({ lastActivity: { current: Date.now() }, warning: { current: false } }).current;
  const loggedOut = useRef(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  const stayConnected = useCallback((): void => {
    refs.lastActivity.current = Date.now();
    refs.warning.current = false;
    setSecondsLeft(null);
  }, [refs]);

  useIdleClock(refs, (remaining, warning) => {
    if (remaining <= 0) {
      if (!loggedOut.current) { loggedOut.current = true; logout('idle'); }
      return;
    }
    refs.warning.current = warning;
    setSecondsLeft(warning ? remaining : null);
  });

  return { secondsLeft, stayConnected };
}
