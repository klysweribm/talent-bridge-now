import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CandidatesQueryDto } from './candidates-query.dto';

describe('CandidatesQueryDto', () => {
  it.each([undefined, 'available', 'assigned'])('should accept assignment %s with default pagination', async (assignment) => {
    const dto = plainToInstance(CandidatesQueryDto, assignment ? { assignment } : {});
    expect(await validate(dto)).toHaveLength(0);
    expect([dto.page, dto.limit, dto.assignment]).toEqual([1, 20, assignment]);
  });

  it.each([{ assignment: 'all' }, { assignment: '' }, { assignment: 'AVAILABLE' }, { page: '0' }, { limit: '51' }, { limit: '0' }])(
    'should reject %p',
    async (query) => {
      expect((await validate(plainToInstance(CandidatesQueryDto, query))).length).toBeGreaterThan(0);
    },
  );
});
