import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateProcessDto } from './create-process.dto';

describe('CreateProcessDto technicalRefIds', () => {
  it('should not accept technicalRefIds on creation', async () => {
    const body = { title: 'T', clientName: 'C', opportunityRole: 'R', skills: ['a'], roleDescription: 'D', band: 8, technicalRefIds: ['a'] };
    const errors = await validate(plainToInstance(CreateProcessDto, body), { whitelist: true, forbidNonWhitelisted: true });
    expect(errors.map((e) => e.property)).toEqual(['technicalRefIds']);
  });
});
