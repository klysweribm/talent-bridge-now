import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  PROCESS_BAND_MAX, PROCESS_BAND_MIN, PROCESS_OPPORTUNITY_ROLE_MAX, PROCESS_ROLE_DESCRIPTION_MAX, PROCESS_SKILLS_MAX, PROCESS_SKILL_MAX,
} from '../constants/process.constants';
import { CreateProcessDto } from './create-process.dto';

const VALID = { title: 'T', clientName: 'C', opportunityRole: 'Dev Senior React', skills: ['React', 'AWS'], roleDescription: 'Perfil senior', band: 8 };
/** Mismas opciones que el `ValidationPipe` global de `main.ts`. */
const errorsFor = async (body: object): Promise<string[]> => {
  const errors = await validate(plainToInstance(CreateProcessDto, body), { whitelist: true, forbidNonWhitelisted: true });
  return errors.map((e) => e.property);
};
const without = (field: string): object => Object.fromEntries(Object.entries(VALID).filter(([key]) => key !== field));
const names = (count: number): string[] => Array.from({ length: count }, (_, i) => `skill-${i}`);

describe('CreateProcessDto opportunity fields', () => {
  it('should accept a valid body and normalize text', async () => {
    const dto = plainToInstance(CreateProcessDto, { ...VALID, opportunityRole: '  Dev  ', roleDescription: ' desc ', skills: [' React ', 'aws', 'AWS', 'react'] });
    expect(await validate(dto, { whitelist: true, forbidNonWhitelisted: true })).toEqual([]);
    expect(dto).toMatchObject({ opportunityRole: 'Dev', roleDescription: 'desc', skills: ['React', 'aws'] });
  });

  it.each(['opportunityRole', 'skills', 'roleDescription', 'band'])('should require %s', async (field) => {
    expect(await errorsFor(without(field))).toEqual([field]);
  });

  it.each([PROCESS_BAND_MIN, PROCESS_BAND_MAX])('should accept band %d', async (band) => {
    expect(await errorsFor({ ...VALID, band })).toEqual([]);
  });

  it.each([PROCESS_BAND_MIN - 1, PROCESS_BAND_MAX + 1, 7.5, '8', null, Number.NaN])('should reject band %p', async (band) => {
    expect(await errorsFor({ ...VALID, band })).toEqual(['band']);
  });

  it.each([
    ['empty', []], ['an empty entry', ['React', '']], ['a blank entry', ['  ']], ['a non string entry', ['React', 3]],
    ['too many', names(PROCESS_SKILLS_MAX + 1)], ['a too long entry', ['x'.repeat(PROCESS_SKILL_MAX + 1)]], ['not an array', 'React'],
  ])('should reject skills that are %s', async (_label, skills) => {
    expect(await errorsFor({ ...VALID, skills })).toEqual(['skills']);
  });

  it('should accept the maximum number of skills and count duplicates once', async () => {
    expect(await errorsFor({ ...VALID, skills: names(PROCESS_SKILLS_MAX) })).toEqual([]);
    expect(await errorsFor({ ...VALID, skills: [...names(PROCESS_SKILLS_MAX), 'SKILL-0'] })).toEqual([]);
  });

  it.each(['opportunityRole', 'roleDescription'])('should reject %s blank, null or too long', async (field) => {
    const max = field === 'opportunityRole' ? PROCESS_OPPORTUNITY_ROLE_MAX : PROCESS_ROLE_DESCRIPTION_MAX;
    for (const value of ['   ', null, 'x'.repeat(max + 1)]) expect(await errorsFor({ ...VALID, [field]: value })).toEqual([field]);
    expect(await errorsFor({ ...VALID, [field]: 'x'.repeat(max) })).toEqual([]);
  });
});

describe('CreateProcessDto startDate', () => {
  it('should accept a body without startDate (it is optional)', async () => {
    expect(await errorsFor(VALID)).toEqual([]);
  });

  it.each(['2026-12-01', '2027-01-31'])('should accept startDate %s', async (startDate) => {
    expect(await errorsFor({ ...VALID, startDate })).toEqual([]);
  });

  it.each(['diciembre', '2026-12', '01/12/2026', '2026-02-30', '2026-13-01', '2026-12-32', '2026-12-01T10:00:00Z', 20261201, null, ''])(
    'should reject startDate %p',
    async (startDate) => {
      expect(await errorsFor({ ...VALID, startDate })).toEqual(['startDate']);
    },
  );
});
