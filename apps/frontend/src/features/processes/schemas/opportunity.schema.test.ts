import { z } from 'zod';
import { buildOpportunityErrors } from '../config/processOpportunity.constants';
import { LIMITS_FIXTURE, makeLimits } from '../test-utils';
import { buildOpportunityShape } from './opportunity.schema';

const LIMITS = LIMITS_FIXTURE.opportunity;
const ERRORS = buildOpportunityErrors(LIMITS);
const schema = z.object(buildOpportunityShape(LIMITS));
const VALID = { opportunityRole: 'Backend Java', skills: ['Java', 'Spring'], roleDescription: 'Evaluar diseño de APIs.', band: 8 };

function messages(input: unknown, current = schema): string[] {
  const result = current.safeParse(input);
  return result.success ? [] : result.error.issues.map(issue => issue.message);
}
const skills = (count: number): string[] => Array.from({ length: count }, (_, index) => `Skill${index}`);

describe('buildOpportunityShape', () => {
  it('should follow the received limits instead of a local copy (skillsMax 3)', () => {
    const tight = makeLimits({ opportunity: { skillsMax: 3 } }).opportunity;
    const tightSchema = z.object(buildOpportunityShape(tight));
    expect(tightSchema.safeParse({ ...VALID, skills: skills(3) }).success).toBe(true);
    expect(messages({ ...VALID, skills: skills(4) }, tightSchema)).toEqual([buildOpportunityErrors(tight).skillsTooMany]);
    expect(buildOpportunityErrors(tight).skillsTooMany).toContain('3');
    expect(schema.safeParse({ ...VALID, skills: skills(4) }).success).toBe(true);
  });

  it('should accept a valid opportunity and trim text and skills', () => {
    const parsed = schema.parse({ ...VALID, opportunityRole: '  Rol ', skills: [' Java '], roleDescription: ' d ' });
    expect(parsed).toEqual({ opportunityRole: 'Rol', skills: ['Java'], roleDescription: 'd', band: 8 });
  });

  it.each([[LIMITS.bandMin - 1], [LIMITS.bandMax + 1], [LIMITS.bandMin + 0.5], [Number.NaN]])('should reject band %s', band => {
    expect(messages({ ...VALID, band })).toHaveLength(1);
  });

  it.each([[LIMITS.bandMin], [LIMITS.bandMax]])('should accept the band limit %i', band => {
    expect(schema.safeParse({ ...VALID, band }).success).toBe(true);
  });

  it('should require the band', () => {
    expect(messages({ ...VALID, band: undefined })).toEqual([ERRORS.bandRequired]);
  });

  it('should require at least one skill', () => {
    expect(messages({ ...VALID, skills: [] })).toEqual([ERRORS.skillsRequired]);
  });

  it('should reject duplicated skills ignoring case', () => {
    expect(messages({ ...VALID, skills: ['Java', 'java'] })).toEqual([ERRORS.skillsDuplicated]);
  });

  it('should cap the number of skills and their length', () => {
    expect(schema.safeParse({ ...VALID, skills: skills(LIMITS.skillsMax) }).success).toBe(true);
    expect(messages({ ...VALID, skills: skills(LIMITS.skillsMax + 1) })).toEqual([ERRORS.skillsTooMany]);
    expect(messages({ ...VALID, skills: ['a'.repeat(LIMITS.skillMax + 1)] })).toEqual([ERRORS.skillTooLong]);
  });

  it('should require role and description', () => {
    expect(messages({ ...VALID, opportunityRole: '  ', roleDescription: '' })).toEqual([ERRORS.roleRequired, ERRORS.descriptionRequired]);
  });

  it('should cap role and description length', () => {
    const ok = { ...VALID, opportunityRole: 'a'.repeat(LIMITS.roleMax), roleDescription: 'a'.repeat(LIMITS.descriptionMax) };
    expect(schema.safeParse(ok).success).toBe(true);
    expect(messages({ ...VALID, opportunityRole: 'a'.repeat(LIMITS.roleMax + 1), roleDescription: 'a'.repeat(LIMITS.descriptionMax + 1) }))
      .toEqual([ERRORS.roleTooLong, ERRORS.descriptionTooLong]);
  });
});
