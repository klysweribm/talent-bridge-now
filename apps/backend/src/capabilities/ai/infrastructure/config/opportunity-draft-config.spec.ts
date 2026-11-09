import { Logger } from '@nestjs/common';
import { OPPORTUNITY_DRAFT_DEFAULT_MAX_TEXT_CHARS, OPPORTUNITY_DRAFT_DEFAULT_TIMEOUT_MS } from '../../domain/opportunity-draft/opportunity-draft.constants';
import { buildOpportunityDraftConfig } from './opportunity-draft-config';

const build = (overrides: Record<string, string | undefined> = {}): ReturnType<typeof buildOpportunityDraftConfig> => {
  const env = overrides;
  return buildOpportunityDraftConfig({ get: (key: string) => env[key] } as never);
};

let warnings: string[];
beforeEach(() => {
  warnings = [];
  jest.spyOn(Logger.prototype, 'warn').mockImplementation((message: unknown) => { warnings.push(String(message)); });
});
afterEach(() => jest.restoreAllMocks());

describe('buildOpportunityDraftConfig', () => {
  it('should read the text cap and the total timeout from the environment', () => {
    expect(build({ OPPORTUNITY_DRAFT_MAX_TEXT_CHARS: '500', OPPORTUNITY_DRAFT_TIMEOUT_MS: '2000' })).toEqual({ maxTextChars: 500, timeoutMs: 2000 });
  });

  it.each([undefined, ''])('should use both defaults without warning when the variables are %j', (value) => {
    expect(build({ OPPORTUNITY_DRAFT_MAX_TEXT_CHARS: value, OPPORTUNITY_DRAFT_TIMEOUT_MS: value })).toEqual({
      maxTextChars: OPPORTUNITY_DRAFT_DEFAULT_MAX_TEXT_CHARS,
      timeoutMs: OPPORTUNITY_DRAFT_DEFAULT_TIMEOUT_MS,
    });
    expect(warnings).toEqual([]);
  });

  it('should default only the missing variable and keep the valid one', () => {
    expect(build({ OPPORTUNITY_DRAFT_MAX_TEXT_CHARS: undefined, OPPORTUNITY_DRAFT_TIMEOUT_MS: '1234' })).toEqual({
      maxTextChars: OPPORTUNITY_DRAFT_DEFAULT_MAX_TEXT_CHARS,
      timeoutMs: 1234,
    });
    expect(build({ OPPORTUNITY_DRAFT_MAX_TEXT_CHARS: '77', OPPORTUNITY_DRAFT_TIMEOUT_MS: undefined })).toEqual({
      maxTextChars: 77,
      timeoutMs: OPPORTUNITY_DRAFT_DEFAULT_TIMEOUT_MS,
    });
  });

  it.each([
    ['OPPORTUNITY_DRAFT_MAX_TEXT_CHARS', 'mucho'],
    ['OPPORTUNITY_DRAFT_MAX_TEXT_CHARS', '0'],
    ['OPPORTUNITY_DRAFT_MAX_TEXT_CHARS', '-5'],
    ['OPPORTUNITY_DRAFT_MAX_TEXT_CHARS', '12.5'],
    ['OPPORTUNITY_DRAFT_TIMEOUT_MS', 'rápido'],
    ['OPPORTUNITY_DRAFT_TIMEOUT_MS', '0'],
  ])('should use the default and warn naming %s when its value is %j', (name, value) => {
    const config = build({ [name]: value });

    expect(config).toEqual({ maxTextChars: OPPORTUNITY_DRAFT_DEFAULT_MAX_TEXT_CHARS, timeoutMs: OPPORTUNITY_DRAFT_DEFAULT_TIMEOUT_MS });
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain(name);
    expect(warnings[0]).not.toContain(value);
  });
});
