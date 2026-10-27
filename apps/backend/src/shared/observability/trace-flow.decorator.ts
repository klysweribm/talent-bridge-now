import { Logger } from '@nestjs/common';
import { flowStorage, type IFlowContext } from './flow-context';
import { formatAdapterLine, toJson } from './flow-log.format';

const logger = new Logger('FlowLog');

function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { then?: unknown }).then === 'function'
  );
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Traza un método público de un puerto (adapter/servicio) dentro de la petición en curso.
 * Sin petición trazada (FlowLog apagado) llama directo al original. No usar sobre controllers.
 */
export function TraceFlow(): MethodDecorator {
  return (target, propertyKey, descriptor: PropertyDescriptor) => {
    const original = descriptor.value as (...args: unknown[]) => unknown;
    const label = `${target.constructor.name}.${String(propertyKey)}`;

    descriptor.value = function (this: unknown, ...args: unknown[]): unknown {
      const store = flowStorage.getStore();
      if (!store) return original.apply(this, args);

      const startedAt = Date.now();
      const log = (detail: string, depth: number): void =>
        logger.log(formatAdapterLine(store.id, depth, label, detail));
      const done = (outcome: string): void => finish(store, log, startedAt, outcome);

      log(`args: ${toJson(args)}`, store.depth);
      store.depth += 1;
      try {
        const result = original.apply(this, args);
        if (!isPromiseLike(result)) {
          done(`← ${toJson(result)}`);
          return result;
        }
        return result.then(
          (value: unknown) => {
            done(`← ${toJson(value)}`);
            return value;
          },
          (error: unknown) => {
            done(`✖ ${errorMessage(error)}`);
            throw error;
          },
        );
      } catch (error) {
        done(`✖ ${errorMessage(error)}`);
        throw error;
      }
    };
  };
}

function finish(
  store: IFlowContext,
  log: (detail: string, depth: number) => void,
  startedAt: number,
  outcome: string,
): void {
  store.depth = Math.max(0, store.depth - 1);
  log(`${outcome} (${Date.now() - startedAt} ms)`, store.depth);
}
