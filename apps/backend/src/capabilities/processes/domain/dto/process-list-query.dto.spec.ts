import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { PROCESS_SEARCH_MAX } from '../constants/process.constants';
import { ProcessListQueryDto } from './process-list-query.dto';

const run = async (query: object): Promise<{ dto: ProcessListQueryDto; errors: string[] }> => {
  const dto = plainToInstance(ProcessListQueryDto, query);
  const errors = await validate(dto, { whitelist: true, forbidNonWhitelisted: true });
  return { dto, errors: errors.map((e) => e.property) };
};

describe('ProcessListQueryDto q', () => {
  it('should leave q undefined when absent', async () => {
    const { dto, errors } = await run({});
    expect(errors).toEqual([]);
    expect(dto.q).toBeUndefined();
  });

  it.each(['', '   ', '\t \n'])('should treat %j as no filter', async (q) => {
    const { dto, errors } = await run({ q });
    expect(errors).toEqual([]);
    expect(dto.q).toBeUndefined();
  });

  it('should trim the term', async () => {
    expect((await run({ q: '  react  ' })).dto.q).toBe('react');
  });

  it('should accept exactly PROCESS_SEARCH_MAX characters and reject one more', async () => {
    expect((await run({ q: 'a'.repeat(PROCESS_SEARCH_MAX) })).errors).toEqual([]);
    expect((await run({ q: 'a'.repeat(PROCESS_SEARCH_MAX + 1) })).errors).toEqual(['q']);
  });

  it('should count the limit after trimming', async () => {
    expect((await run({ q: ` ${'a'.repeat(PROCESS_SEARCH_MAX)} ` })).errors).toEqual([]);
  });

  it.each([[['a', 'b']], [5], [{ a: 1 }], [true]])('should reject non-string q %j', async (q) => {
    expect((await run({ q })).errors).toEqual(['q']);
  });

  it('should keep page and limit validation', async () => {
    expect((await run({ page: '0' })).errors).toEqual(['page']);
  });
});
