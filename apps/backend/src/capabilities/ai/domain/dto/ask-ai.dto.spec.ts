import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AI_QUERY_MAX_LENGTH } from '../constants/ai.constants';
import { AskAiDto } from './ask-ai.dto';

async function check(plain: Record<string, unknown>): Promise<{ dto: AskAiDto; errors: readonly string[] }> {
  const dto = plainToInstance(AskAiDto, plain);
  const errors = await validate(dto, { whitelist: true, forbidNonWhitelisted: true });
  return { dto, errors: errors.map((error) => error.property) };
}

describe('AskAiDto', () => {
  it('should accept a general topic with a normal query and trim it', async () => {
    const { dto, errors } = await check({ topic: 'general', query: '  Hola  ' });

    expect(errors).toEqual([]);
    expect(dto.query).toBe('Hola');
  });

  it('should accept a query of exactly the maximum length', async () => {
    expect((await check({ topic: 'general', query: 'x'.repeat(AI_QUERY_MAX_LENGTH) })).errors).toEqual([]);
  });

  it.each([
    ['unknown topic', { topic: 'cv', query: 'x' }, 'topic'],
    ['missing topic', { query: 'x' }, 'topic'],
    ['empty query', { topic: 'general', query: '' }, 'query'],
    ['blank query', { topic: 'general', query: '   ' }, 'query'],
    ['non-string query', { topic: 'general', query: 5 }, 'query'],
    ['too long query', { topic: 'general', query: 'x'.repeat(AI_QUERY_MAX_LENGTH + 1) }, 'query'],
    ['extra field', { topic: 'general', query: 'x', context: 'y' }, 'context'],
  ])('should reject %s', async (_name, plain, property) => {
    expect((await check(plain)).errors).toContain(property);
  });
});
