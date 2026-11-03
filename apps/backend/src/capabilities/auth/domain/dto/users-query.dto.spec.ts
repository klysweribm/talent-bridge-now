import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UsersQueryDto } from './users-query.dto';

const errorsFor = (plain: object): ReturnType<typeof validate> => validate(plainToInstance(UsersQueryDto, plain));

describe('UsersQueryDto', () => {
  it.each(['pm', 'recruiter', 'technical_ref'])('should accept role %s with default pagination', async (role) => {
    const dto = plainToInstance(UsersQueryDto, { role });
    expect(await validate(dto)).toHaveLength(0);
    expect([dto.page, dto.limit]).toEqual([1, 20]);
  });

  it.each([{}, { role: 'admin' }, { role: 'pm', limit: '51' }, { role: 'pm', page: '0' }])(
    'should reject %p',
    async (query) => {
      expect((await errorsFor(query)).length).toBeGreaterThan(0);
    },
  );
});
