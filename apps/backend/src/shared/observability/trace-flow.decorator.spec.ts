import { flowStorage, type IFlowContext } from './flow-context';
import { TraceFlow } from './trace-flow.decorator';
import { Logger } from '@nestjs/common';

class FakeAdapter {
  readonly marker = 'adapter-state';

  @TraceFlow()
  syncCall(value: string): string {
    return `${this.marker}:${value}`;
  }

  @TraceFlow()
  async asyncCall(value: string): Promise<string> {
    return Promise.resolve(value.toUpperCase());
  }

  @TraceFlow()
  async failing(): Promise<void> {
    return Promise.reject(new Error('boom'));
  }

  @TraceFlow()
  syncFailing(): void {
    throw new Error('sync-boom');
  }
}

const logged = (spy: jest.SpyInstance): string =>
  (spy.mock.calls as unknown[][]).map((call) => String(call[0])).join('\n');

const newContext = (): IFlowContext => ({ id: 'abc123', startedAt: Date.now(), reachedHandler: false, depth: 0 });

describe('TraceFlow', () => {
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
  });
  afterEach(() => logSpy.mockRestore());

  it('should call through silently without an active flow', () => {
    expect(new FakeAdapter().syncCall('x')).toBe('adapter-state:x');
    expect(logSpy).not.toHaveBeenCalled();
  });

  it('should log args and result and keep this for sync methods', () => {
    const result = flowStorage.run(newContext(), () => new FakeAdapter().syncCall('x'));
    expect(result).toBe('adapter-state:x');
    const output = logged(logSpy);
    expect(output).toContain('FakeAdapter.syncCall');
    expect(output).toContain('args: ["x"]');
    expect(output).toContain('← "adapter-state:x"');
  });

  it('should log the resolved value of async methods', async () => {
    const result = await flowStorage.run(newContext(), () => new FakeAdapter().asyncCall('hi'));
    expect(result).toBe('HI');
    expect(logged(logSpy)).toContain('← "HI"');
  });

  it('should log and rethrow async errors', async () => {
    await expect(flowStorage.run(newContext(), () => new FakeAdapter().failing())).rejects.toThrow('boom');
    expect(logged(logSpy)).toContain('✖ boom');
  });

  it('should log and rethrow sync errors', () => {
    expect(() => flowStorage.run(newContext(), () => new FakeAdapter().syncFailing())).toThrow('sync-boom');
    expect(logged(logSpy)).toContain('✖ sync-boom');
  });
});
