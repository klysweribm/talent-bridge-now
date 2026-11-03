import { z } from 'zod';
import { OPPORTUNITY_ERRORS, OPPORTUNITY_LIMITS } from '../config/processOpportunity.constants';
import { opportunityShape } from './opportunity.schema';

const schema = z.object(opportunityShape);
const VALID = { opportunityRole: 'Backend Java', skills: ['Java', 'Spring'], roleDescription: 'Evaluar diseño de APIs.', band: 8 };

function messages(input: unknown): string[] {
  const result = schema.safeParse(input);
  return result.success ? [] : result.error.issues.map(issue => issue.message);
}

describe('opportunityShape', () => {
  it('should accept a valid opportunity and trim text and skills', () => {
    const parsed = schema.parse({ ...VALID, opportunityRole: '  Rol ', skills: [' Java '], roleDescription: ' d ' });
    expect(parsed).toEqual({ opportunityRole: 'Rol', skills: ['Java'], roleDescription: 'd', band: 8 });
  });

  it.each([[5], [11], [7.5], [Number.NaN]])('should reject band %s', band => {
    expect(messages({ ...VALID, band })).toHaveLength(1);
  });

  it.each([[6], [10]])('should accept the band limit %i', band => {
    expect(schema.safeParse({ ...VALID, band }).success).toBe(true);
  });

  it('should require the band', () => {
    expect(messages({ ...VALID, band: undefined })).toEqual([OPPORTUNITY_ERRORS.bandRequired]);
  });

  it('should reject an empty skills list', () => {
    expect(messages({ ...VALID, skills: [] })).toEqual([OPPORTUNITY_ERRORS.skillsRequired]);
  });

  it('should reject case-insensitive duplicate skills', () => {
    expect(messages({ ...VALID, skills: ['Java', 'java'] })).toEqual([OPPORTUNITY_ERRORS.skillsDuplicated]);
  });

  it('should reject more skills than the limit but accept exactly the limit', () => {
    const skills = (count: number): string[] => Array.from({ length: count }, (_, index) => `S${index}`);
    expect(schema.safeParse({ ...VALID, skills: skills(OPPORTUNITY_LIMITS.skillsMax) }).success).toBe(true);
    expect(messages({ ...VALID, skills: skills(OPPORTUNITY_LIMITS.skillsMax + 1) })).toEqual([OPPORTUNITY_ERRORS.skillsTooMany]);
  });

  it('should reject a skill over the max length', () => {
    expect(messages({ ...VALID, skills: ['a'.repeat(OPPORTUNITY_LIMITS.skillMax + 1)] })).toEqual([OPPORTUNITY_ERRORS.skillTooLong]);
  });

  it('should reject blank role and description', () => {
    expect(messages({ ...VALID, opportunityRole: '  ', roleDescription: '' }))
      .toEqual([OPPORTUNITY_ERRORS.roleRequired, OPPORTUNITY_ERRORS.descriptionRequired]);
  });

  it('should reject role and description over the max but accept exactly the max', () => {
    const ok = { ...VALID, opportunityRole: 'a'.repeat(OPPORTUNITY_LIMITS.roleMax), roleDescription: 'a'.repeat(OPPORTUNITY_LIMITS.descriptionMax) };
    expect(schema.safeParse(ok).success).toBe(true);
    expect(messages({ ...VALID, opportunityRole: 'a'.repeat(OPPORTUNITY_LIMITS.roleMax + 1), roleDescription: 'a'.repeat(OPPORTUNITY_LIMITS.descriptionMax + 1) }))
      .toEqual([OPPORTUNITY_ERRORS.roleTooLong, OPPORTUNITY_ERRORS.descriptionTooLong]);
  });
});
