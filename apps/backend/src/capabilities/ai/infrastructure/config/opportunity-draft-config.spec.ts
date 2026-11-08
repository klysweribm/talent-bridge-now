import { Logger } from '@nestjs/common';
import { buildOpportunityDraftConfig } from './opportunity-draft-config';

const BASE: Record<string, string> = { OPPORTUNITY_DRAFT_MAX_TEXT_CHARS: '8000', OPPORTUNITY_DRAFT_TIMEOUT_MS: '30000' };
const build = (overrides: Record<string, string | undefined> = {}): ReturnType<typeof buildOpportunityDraftConfig> => {
  const env = { ...BASE, ...overrides };
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
    expect(build()).toEqual({ enabled: true, maxTextChars: 8000, timeoutMs: 30000 });
  });

  it.each([
    ['OPPORTUNITY_DRAFT_MAX_TEXT_CHARS', undefined],
    ['OPPORTUNITY_DRAFT_MAX_TEXT_CHARS', 'mucho'],
    ['OPPORTUNITY_DRAFT_MAX_TEXT_CHARS', '0'],
    ['OPPORTUNITY_DRAFT_MAX_TEXT_CHARS', '-5'],
    ['OPPORTUNITY_DRAFT_MAX_TEXT_CHARS', '12.5'],
    ['OPPORTUNITY_DRAFT_TIMEOUT_MS', undefined],
    ['OPPORTUNITY_DRAFT_TIMEOUT_MS', 'rápido'],
    ['OPPORTUNITY_DRAFT_TIMEOUT_MS', '0'],
  ])('should fail closed and name %s when its value is %j', (name, value) => {
    expect(build({ [name]: value })).toEqual({ enabled: false });
    expect(warnings.join(' ')).toContain(name);
  });

  it('should never print the offending value in the warning', () => {
    build({ OPPORTUNITY_DRAFT_TIMEOUT_MS: 'secreto-xyz' });

    expect(warnings.join(' ')).not.toContain('secreto-xyz');
  });
});
