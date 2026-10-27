import { AsyncLocalStorage } from 'node:async_hooks';

export interface IFlowContext {
  readonly id: string;
  readonly startedAt: number;
  capability?: string;
  reachedHandler: boolean;
  depth: number;
}

/** Enlaza los `@TraceFlow()` de adapters/servicios con la petición HTTP en curso. */
export const flowStorage = new AsyncLocalStorage<IFlowContext>();
