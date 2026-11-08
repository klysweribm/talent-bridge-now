import { PROCESS_DATA_ERRORS, PROCESS_TEXT_MAX_LENGTH } from '../config/processCreate.constants';
import { buildProcessDataSchema } from './processData.schema';

import { LIMITS_FIXTURE, OPPORTUNITY_FIXTURE } from '../test-utils';

const BASE = { title: 'Backend Senior', clientName: 'Banco X', ...OPPORTUNITY_FIXTURE, skills: [...OPPORTUNITY_FIXTURE.skills] };

function messages(role: 'pm' | 'recruiter', input: unknown): string[] {
  const result = buildProcessDataSchema(role, LIMITS_FIXTURE.opportunity).safeParse(input);
  return result.success ? [] : result.error.issues.map(issue => issue.message);
}

describe('buildProcessDataSchema', () => {
  it('should accept a PM without recruiter', () => {
    expect(buildProcessDataSchema('pm', LIMITS_FIXTURE.opportunity).safeParse(BASE).success).toBe(true);
  });

  it('should accept a PM with optional recruiter', () => {
    expect(buildProcessDataSchema('pm', LIMITS_FIXTURE.opportunity).safeParse({ ...BASE, recruiterId: 'r1' }).success).toBe(true);
  });

  it('should accept a recruiter with an owner PM', () => {
    expect(buildProcessDataSchema('recruiter', LIMITS_FIXTURE.opportunity).safeParse({ ...BASE, ownerPmId: 'pm1' }).success).toBe(true);
  });

  it('should reject a recruiter without owner PM', () => {
    expect(messages('recruiter', BASE)).toEqual([PROCESS_DATA_ERRORS.ownerPmRequired]);
  });

  it('should reject a recruiter with an empty owner PM', () => {
    expect(messages('recruiter', { ...BASE, ownerPmId: '' })).toEqual([PROCESS_DATA_ERRORS.ownerPmRequired]);
  });

  it('should not require owner PM for a PM, even when empty', () => {
    expect(buildProcessDataSchema('pm', LIMITS_FIXTURE.opportunity).safeParse({ ...BASE, ownerPmId: '' }).success).toBe(true);
  });

  it('should trim title and client', () => {
    const result = buildProcessDataSchema('pm', LIMITS_FIXTURE.opportunity).parse({ ...BASE, title: '  A  ', clientName: ' B ' });
    expect([result.title, result.clientName]).toEqual(['A', 'B']);
  });

  it('should require every opportunity field when creating', () => {
    expect(messages('pm', { title: 'T', clientName: 'C' })).toHaveLength(4);
  });

  it('should reject blank title and client', () => {
    expect(messages('pm', { ...BASE, title: '   ', clientName: '' })).toEqual([PROCESS_DATA_ERRORS.titleRequired, PROCESS_DATA_ERRORS.clientRequired]);
  });

  it('should reject text over the max length but accept exactly the max', () => {
    const max = 'a'.repeat(PROCESS_TEXT_MAX_LENGTH);
    expect(buildProcessDataSchema('pm', LIMITS_FIXTURE.opportunity).safeParse({ ...BASE, title: max, clientName: max }).success).toBe(true);
    expect(messages('pm', { ...BASE, title: `${max}a`, clientName: `${max}a` }))
      .toEqual([PROCESS_DATA_ERRORS.titleTooLong, PROCESS_DATA_ERRORS.clientTooLong]);
  });
});
