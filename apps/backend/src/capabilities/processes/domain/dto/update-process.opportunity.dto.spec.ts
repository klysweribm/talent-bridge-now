import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { PROCESS_BAND_MAX, PROCESS_BAND_MIN, PROCESS_SKILLS_MAX } from '../constants/process.constants';
import { UpdateProcessDto } from './update-process.dto';

const errorsFor = async (body: object): Promise<string[]> => {
  const errors = await validate(plainToInstance(UpdateProcessDto, body), { whitelist: true, forbidNonWhitelisted: true });
  return errors.map((e) => e.property);
};

describe('UpdateProcessDto opportunity fields', () => {
  it.each(['opportunityRole', 'skills', 'roleDescription', 'band'])('should reject null in %s', async (field) => {
    expect(await errorsFor({ [field]: null })).toEqual([field]);
  });

  it('should accept valid opportunity fields and normalize them', async () => {
    const body = { opportunityRole: ' Dev ', skills: [' React ', 'react', 'AWS'], roleDescription: ' d ', band: PROCESS_BAND_MIN };
    const dto = plainToInstance(UpdateProcessDto, body);
    expect(await validate(dto, { whitelist: true, forbidNonWhitelisted: true })).toEqual([]);
    expect(dto).toMatchObject({ opportunityRole: 'Dev', skills: ['React', 'AWS'], roleDescription: 'd', band: PROCESS_BAND_MIN });
  });

  it.each([
    [{ band: PROCESS_BAND_MAX + 1 }, 'band'], [{ band: 7.5 }, 'band'], [{ band: '8' }, 'band'],
    [{ skills: [] }, 'skills'], [{ skills: ['a', ''] }, 'skills'], [{ skills: Array.from({ length: PROCESS_SKILLS_MAX + 1 }, (_, i) => `s${i}`) }, 'skills'],
    [{ opportunityRole: '  ' }, 'opportunityRole'], [{ roleDescription: '' }, 'roleDescription'],
  ])('should reject invalid %j', async (body, field) => {
    expect(await errorsFor(body)).toEqual([field]);
  });
});
