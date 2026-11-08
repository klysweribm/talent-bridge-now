import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { OPPORTUNITY_DRAFT_MESSAGES } from '../opportunity-draft/opportunity-draft.constants';
import { OpportunityDraftDto } from './opportunity-draft.dto';

const messages = async (body: unknown): Promise<string[]> =>
  (await validate(plainToInstance(OpportunityDraftDto, body))).flatMap((e) => Object.values(e.constraints ?? {}));

describe('OpportunityDraftDto', () => {
  it('should accept a text and trim it', async () => {
    const dto = plainToInstance(OpportunityDraftDto, { text: '  Fullstack React  ' });

    expect(await validate(dto)).toHaveLength(0);
    expect(dto.text).toBe('Fullstack React');
  });

  it.each([{ text: '' }, { text: '    ' }, {}])('should reject %j with the required-text message', async (body) => {
    expect(await messages(body)).toContain(OPPORTUNITY_DRAFT_MESSAGES.textRequired);
  });

  it.each([{ text: 42 }, { text: null }, { text: ['a'] }])('should reject the non-string %j', async (body) => {
    expect(await messages(body)).not.toHaveLength(0);
  });

  it('should NOT cap the length: the cap is configurable and checked by the service', async () => {
    expect(await validate(plainToInstance(OpportunityDraftDto, { text: 'x'.repeat(50_000) }))).toHaveLength(0);
  });
});
