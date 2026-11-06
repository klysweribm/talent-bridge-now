import { z } from 'zod';
import { buildOpportunityErrors } from '../config/processOpportunity.constants';
import { LIMITS_FIXTURE } from '../test-utils';
import { buildOpportunityShape } from './opportunity.schema';

const LIMITS = LIMITS_FIXTURE.opportunity;
const ERRORS = buildOpportunityErrors(LIMITS);
const schema = z.object(buildOpportunityShape(LIMITS));
const VALID = { opportunityRole: 'Backend Java', skills: ['Java'], roleDescription: 'Evaluar APIs.', band: 8 };

const messages = (input: unknown): string[] => {
  const result = schema.safeParse(input);
  return result.success ? [] : result.error.issues.map(issue => issue.message);
};

describe('buildOpportunityShape startDate', () => {
  it.each([[undefined], ['']])('should treat startDate %p as not provided', startDate => {
    expect(messages({ ...VALID, startDate })).toEqual([]);
  });

  it.each([['2026-12-01'], ['2027-02-28']])('should accept the real date %s', startDate => {
    expect(schema.parse({ ...VALID, startDate }).startDate).toBe(startDate);
  });

  it.each([['diciembre'], ['2026-02-30'], ['01/12/2026'], ['2026-13-01'], ['2026-12-01T10:00']])('should reject %s', startDate => {
    expect(messages({ ...VALID, startDate })).toEqual([ERRORS.startDateInvalid]);
  });
});
