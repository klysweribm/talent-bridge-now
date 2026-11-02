import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { PROCESS_CLIENT_NAME_MAX, PROCESS_TITLE_MAX } from '../constants/process.constants';
import { UpdateProcessDto } from './update-process.dto';

/** Mismas opciones que el `ValidationPipe` global de `main.ts`. */
const errorsFor = async (body: object): Promise<string[]> => {
  const errors = await validate(plainToInstance(UpdateProcessDto, body), { whitelist: true, forbidNonWhitelisted: true });
  return errors.map((e) => e.property);
};

describe('UpdateProcessDto', () => {
  it('should accept an empty body', async () => {
    expect(await errorsFor({})).toEqual([]);
  });

  it('should accept valid values for every field and trim text', async () => {
    const dto = plainToInstance(UpdateProcessDto, { title: '  A  ', clientName: ' B ', recruiterId: 'r1', status: 'interviewing' });
    expect(await validate(dto, { whitelist: true, forbidNonWhitelisted: true })).toEqual([]);
    expect(dto).toMatchObject({ title: 'A', clientName: 'B' });
  });

  it.each(['title', 'clientName', 'recruiterId', 'status'])('should reject null in %s', async (field) => {
    expect(await errorsFor({ [field]: null })).toEqual([field]);
  });

  it.each(['title', 'clientName'])('should reject %s empty after trim', async (field) => {
    expect(await errorsFor({ [field]: '   ' })).toEqual([field]);
  });

  it('should reject an empty recruiterId', async () => {
    expect(await errorsFor({ recruiterId: '' })).toEqual(['recruiterId']);
  });

  it('should reject too long title and clientName', async () => {
    expect(await errorsFor({ title: 'x'.repeat(PROCESS_TITLE_MAX + 1) })).toEqual(['title']);
    expect(await errorsFor({ clientName: 'x'.repeat(PROCESS_CLIENT_NAME_MAX + 1) })).toEqual(['clientName']);
  });

  it('should reject an invalid status', async () => {
    expect(await errorsFor({ status: 'active' })).toEqual(['status']);
  });

  it('should reject unknown fields', async () => {
    expect(await errorsFor({ hack: 1 })).toEqual(['hack']);
  });
});
