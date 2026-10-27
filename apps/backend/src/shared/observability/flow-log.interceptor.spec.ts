import { BadRequestException, RequestMethod, type CallHandler, type ExecutionContext } from '@nestjs/common';
import { METHOD_METADATA } from '@nestjs/common/constants';
import { firstValueFrom, of, throwError } from 'rxjs';
import { flowStorage, type IFlowContext } from './flow-context';
import { FlowLogInterceptor } from './flow-log.interceptor';
import type { FlowLogService } from './flow-log.service';

class AuthController {
  devLogin(): void {
    return undefined;
  }
}
// Simula @Post(): Nest guarda el verbo HTTP como metadata del handler.
Reflect.defineMetadata(
  METHOD_METADATA,
  RequestMethod.POST,
  Object.getOwnPropertyDescriptor(AuthController.prototype, 'devLogin')?.value as object,
);
class ProcessStagesController {
  list(): void {
    return undefined;
  }
}

function contextFor(controller: new () => object, handlerName: string): ExecutionContext {
  const instance = new controller() as Record<string, () => void>;
  return {
    getType: () => 'http',
    getClass: () => controller,
    getHandler: () => instance[handlerName],
    switchToHttp: () => ({
      getRequest: () => ({
        method: 'POST',
        originalUrl: '/api/v1/x',
        headers: { authorization: 'Bearer fake' },
        query: {},
        body: { email: 'ana@ibm.com' },
      }),
    }),
  } as unknown as ExecutionContext;
}

const newStore = (): IFlowContext => ({ id: 'abc123', startedAt: Date.now(), reachedHandler: false, depth: 0 });

describe('FlowLogInterceptor', () => {
  const emit = jest.fn<void, [string]>();
  const build = (enabled: boolean): FlowLogInterceptor =>
    new FlowLogInterceptor({ enabled, emit } as unknown as FlowLogService);
  beforeEach(() => emit.mockClear());

  it('should print nothing when disabled', async () => {
    const handler: CallHandler = { handle: () => of('ok') };
    await flowStorage.run(newStore(), () =>
      firstValueFrom(build(false).intercept(contextFor(AuthController, 'devLogin'), handler)),
    );
    expect(emit).not.toHaveBeenCalled();
  });

  it('should print request and response on success and derive the capability', async () => {
    const store = newStore();
    const handler: CallHandler = { handle: () => of({ accessToken: 'x', ok: true }) };
    await flowStorage.run(store, () =>
      firstValueFrom(build(true).intercept(contextFor(AuthController, 'devLogin'), handler)),
    );
    expect(store.reachedHandler).toBe(true);
    expect(emit).toHaveBeenCalledTimes(2);
    const [request, response] = emit.mock.calls.map(([block]) => block);
    expect(request).toContain('capability: auth');
    expect(request).toContain('AuthController.devLogin');
    expect(request).toContain('"authorization":"[REDACTED]"');
    expect(response).toContain('status: 201');
    expect(response).toContain('"accessToken":"[REDACTED]"');
  });

  it('should derive kebab-case capability names', async () => {
    const handler: CallHandler = { handle: () => of(1) };
    await flowStorage.run(newStore(), () =>
      firstValueFrom(build(true).intercept(contextFor(ProcessStagesController, 'list'), handler)),
    );
    expect(emit.mock.calls[0][0]).toContain('capability: process-stages');
  });

  it('should print the error status and rethrow', async () => {
    const handler: CallHandler = { handle: () => throwError(() => new BadRequestException('bad')) };
    await expect(
      flowStorage.run(newStore(), () =>
        firstValueFrom(build(true).intercept(contextFor(AuthController, 'devLogin'), handler)),
      ),
    ).rejects.toThrow('bad');
    expect(emit.mock.calls[1][0]).toContain('status: 400');
  });
});
