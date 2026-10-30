import { useEffect, useRef } from 'react';
import { ENV } from '@/config/env';

export const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'] as const;
const TICK_MS = 1000;
const THROTTLE_MS = 1000;

/** Segundos que faltan para el cierre y si ya se está en aviso, según `Date.now()`. */
function readIdle(lastActivity: number): { remaining: number; warning: boolean } {
  const elapsed = (Date.now() - lastActivity) / 1000;
  return {
    remaining: Math.ceil(ENV.VITE_IDLE_TIMEOUT_SECONDS + ENV.VITE_IDLE_WARNING_SECONDS - elapsed),
    warning: elapsed >= ENV.VITE_IDLE_TIMEOUT_SECONDS,
  };
}

export interface IIdleRefs {
  readonly lastActivity: { current: number };
  readonly warning: { current: boolean };
}

/** Listeners de actividad + tick por reloj de pared; limpia ambos al desmontar. */
export function useIdleClock(refs: IIdleRefs, onTick: (remaining: number, warning: boolean) => void): void {
  const tickRef = useRef(onTick);
  tickRef.current = onTick;

  useEffect(() => {
    const onActivity = (): void => {
      const now = Date.now();
      if (!refs.warning.current && now - refs.lastActivity.current >= THROTTLE_MS) refs.lastActivity.current = now;
    };
    ACTIVITY_EVENTS.forEach(e => window.addEventListener(e, onActivity, { passive: true }));
    const timer = setInterval(() => {
      const idle = readIdle(refs.lastActivity.current);
      tickRef.current(idle.remaining, idle.warning);
    }, TICK_MS);
    return () => {
      ACTIVITY_EVENTS.forEach(e => window.removeEventListener(e, onActivity));
      clearInterval(timer);
    };
  }, [refs]);
}
