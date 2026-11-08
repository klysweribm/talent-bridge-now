import { EventEmitter } from 'node:events';
import type { NextFunction, Request, Response } from 'express';
import { flowStorage } from './flow-context';
import { FlowLogMiddleware } from './flow-log.middleware';
import type { FlowLogService } from './flow-log.service';

const SECRET_TEXT = 'ZZ-TEXTO-INVENTADO-123';

describe('FlowLogMiddleware', () => {
  const emit = jest.fn<void, [string]>();
  const middleware = new FlowLogMiddleware({ enabled: true, isIgnoredPath: () => false, emit } as unknown as FlowLogService);

  function run(reachHandler: boolean): string {
    const res = Object.assign(new EventEmitter(), { statusCode: 400 }) as unknown as Response;
    const req = { method: 'POST', originalUrl: '/api/v1/x', headers: {}, query: {}, body: { text: SECRET_TEXT } } as unknown as Request;
    const next: NextFunction = () => {
      const store = flowStorage.getStore();
      if (store && reachHandler) store.reachedHandler = true;
    };
    middleware.use(req, res, next);
    res.emit('finish');
    return emit.mock.calls.map(([block]) => block).join('\n');
  }

  beforeEach(() => emit.mockClear());

  it('should not print the request body when the handler was never reached', () => {
    const printed = run(false);
    expect(printed).toContain('rechazada antes del handler');
    expect(printed).not.toContain(SECRET_TEXT);
    expect(printed).toContain('"omitted":true');
  });

  it('should print nothing when the interceptor already logged the request', () => {
    expect(run(true)).toBe('');
  });
});
