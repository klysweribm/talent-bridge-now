import { buildProcessesConfig } from './processes.config';

const cfg = (value: string | undefined): never => ({ get: () => value }) as never;

describe('buildProcessesConfig', () => {
  it('should read MAX_CANDIDATES_PER_PROCESS', () => {
    expect(buildProcessesConfig(cfg('8')).maxCandidatesPerProcess).toBe(8);
  });

  it.each([undefined, '', '0', '-2', '2.5', 'abc'])('should fall back to 5 when the value is %p', (value) => {
    expect(buildProcessesConfig(cfg(value)).maxCandidatesPerProcess).toBe(5);
  });
});
