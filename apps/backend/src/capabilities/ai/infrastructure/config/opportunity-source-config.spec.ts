import { Logger } from '@nestjs/common';
import { buildOpportunitySourceConfig } from './opportunity-source-config';

const build = (value: string | undefined): ReturnType<typeof buildOpportunitySourceConfig> =>
  buildOpportunitySourceConfig({ get: () => value } as never);

let warnings: string[];
beforeEach(() => {
  warnings = [];
  jest.spyOn(Logger.prototype, 'warn').mockImplementation((message: unknown) => { warnings.push(String(message)); });
});
afterEach(() => jest.restoreAllMocks());

const DEFAULT = { maxFileBytes: 5_242_880 };

describe('buildOpportunitySourceConfig', () => {
  it('should read the max file size from the environment', () => {
    expect(build('1234')).toEqual({ maxFileBytes: 1234 });
    expect(warnings).toEqual([]);
  });

  it.each([undefined, ''])('should use the default without warning when the variable is missing (%p)', (value) => {
    expect(build(value)).toEqual(DEFAULT);
    expect(warnings).toEqual([]);
  });

  it.each(['grande', '0', '-5', '12.5'])('should use the default and warn which variable fails when the value is %p', (value) => {
    expect(build(value)).toEqual(DEFAULT);
    expect(warnings.join(' ')).toContain('OPPORTUNITY_SOURCE_MAX_FILE_BYTES');
  });

  it('should never log the value', () => {
    build('grande');

    expect(warnings.join(' ')).not.toContain('grande');
  });
});
