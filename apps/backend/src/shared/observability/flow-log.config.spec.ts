import { isFlowLogEnabled } from './flow-log.config';

const configOf = (values: Record<string, string>): { get: <T>(key: string) => T | undefined } => ({
  get: <T>(key: string): T | undefined => values[key] as T | undefined,
});

describe('isFlowLogEnabled', () => {
  it('should be disabled when the flag is absent', () => {
    expect(isFlowLogEnabled(configOf({ NODE_ENV: 'development' }))).toBe(false);
  });

  it('should be disabled when the flag is misspelled', () => {
    expect(isFlowLogEnabled(configOf({ FLOW_LOG_ENABLED: 'TRUE' }))).toBe(false);
    expect(isFlowLogEnabled(configOf({ FLOW_LOG_ENABLED: '1' }))).toBe(false);
  });

  it('should be enabled with the exact flag outside production', () => {
    expect(isFlowLogEnabled(configOf({ FLOW_LOG_ENABLED: 'true', NODE_ENV: 'development' }))).toBe(true);
  });

  it('should be disabled in production even with the flag on', () => {
    expect(isFlowLogEnabled(configOf({ FLOW_LOG_ENABLED: 'true', NODE_ENV: 'production' }))).toBe(false);
  });
});
