import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_SKILLS_FILTER } from '../constants/bench.constants';
import { BenchQueryDto } from './bench-query.dto';

async function check(plain: Record<string, unknown>): Promise<{ dto: BenchQueryDto; errors: readonly string[] }> {
  const dto = plainToInstance(BenchQueryDto, plain);
  const errors = await validate(dto, { whitelist: true, forbidNonWhitelisted: true });
  return { dto, errors: errors.map((error) => error.property) };
}

describe('BenchQueryDto', () => {
  it('should apply page and limit defaults when the query is empty', async () => {
    const { dto, errors } = await check({});

    expect(errors).toEqual([]);
    expect(dto.page).toBe(DEFAULT_PAGE);
    expect(dto.limit).toBe(DEFAULT_LIMIT);
  });

  it.each([1, 20, 50])('should accept limit %s', async (limit) => {
    expect((await check({ limit: String(limit) })).errors).toEqual([]);
  });

  it.each(['0', '51', '500', '-1', '1.5', 'abc'])('should reject limit %s', async (limit) => {
    expect((await check({ limit })).errors).toEqual(['limit']);
  });

  it.each(['0', '-3', '1.5', 'x'])('should reject page %s', async (page) => {
    expect((await check({ page })).errors).toEqual(['page']);
  });

});

describe('BenchQueryDto list params', () => {
  it('should split a comma separated skills param into trimmed names', async () => {
    const { dto, errors } = await check({ skills: 'Java, Spring Boot ' });

    expect(errors).toEqual([]);
    expect(dto.skills).toEqual(['Java', 'Spring Boot']);
  });

  it('should accept the repeated skills param form', async () => {
    const { dto, errors } = await check({ skills: ['Java', 'Spring Boot'] });

    expect(errors).toEqual([]);
    expect(dto.skills).toEqual(['Java', 'Spring Boot']);
  });

  it('should reject an empty skill name when the list has a blank entry', async () => {
    expect((await check({ skills: 'Java,' })).errors).toEqual(['skills']);
  });

  it('should reject more skills than the allowed maximum', async () => {
    const skills = Array.from({ length: MAX_SKILLS_FILTER + 1 }, (_, index) => `S${index}`).join(',');

    expect((await check({ skills })).errors).toEqual(['skills']);
  });

  it('should accept comma separated seniority and status values', async () => {
    const { dto, errors } = await check({ seniority: 'sr,lead', status: 'available,assigned' });

    expect(errors).toEqual([]);
    expect(dto.seniority).toEqual(['sr', 'lead']);
    expect(dto.status).toEqual(['available', 'assigned']);
  });

  it('should reject an unknown seniority', async () => {
    expect((await check({ seniority: 'guru' })).errors).toEqual(['seniority']);
  });

  it('should reject an unknown status', async () => {
    expect((await check({ status: 'retired' })).errors).toEqual(['status']);
  });

});

describe('BenchQueryDto date and country', () => {
  it.each(['2026-11-01', '2026-11-15', '2026-11-01T10:30Z', '2026-11-01T10:30:15.123Z', '2026-11-01T10:30:00-03:00'])(
    'should accept availableBy %s',
    async (value) => {
      expect((await check({ availableBy: value })).errors).toEqual([]);
    },
  );

  it.each(['no-es-fecha', '2026-13-45', '15/11/2026', '2026-W44', '2026-W44-3', '2026-305', '2026-02-30'])('should reject availableBy %s', async (value) => {
    expect((await check({ availableBy: value })).errors).toEqual(['availableBy']);
  });

  it('should trim the country', async () => {
    expect((await check({ country: '  Chile ' })).dto.country).toBe('Chile');
  });
});
