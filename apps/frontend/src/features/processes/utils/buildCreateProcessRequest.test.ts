import { OPPORTUNITY_FIXTURE } from '../test-utils';
import { buildCreateProcessRequest } from './buildCreateProcessRequest';

const CANDIDATES = [{ id: 'c1', fullName: 'Ana' }, { id: 'c2', fullName: 'Luis', primaryRole: 'QA' }];
const OPP = { ...OPPORTUNITY_FIXTURE };
const BASE = { title: 'T', clientName: 'C', ...OPP };

describe('buildCreateProcessRequest', () => {
  it('should send ownerPmId and no recruiterId for a recruiter', () => {
    const state = { data: { ...BASE, ownerPmId: 'pm1', recruiterId: 'stale' }, candidates: CANDIDATES };
    expect(buildCreateProcessRequest(state, 'recruiter')).toEqual({ ...BASE, ownerPmId: 'pm1', candidateIds: ['c1', 'c2'] });
  });

  it('should send recruiterId and no ownerPmId for a PM that chose one', () => {
    const state = { data: { ...BASE, ownerPmId: 'stale', recruiterId: 'r1' }, candidates: CANDIDATES };
    expect(buildCreateProcessRequest(state, 'pm')).toEqual({ ...BASE, recruiterId: 'r1', candidateIds: ['c1', 'c2'] });
  });

  it('should omit recruiterId and candidateIds for a PM with neither', () => {
    const request = buildCreateProcessRequest({ data: { ...BASE, recruiterId: '' }, candidates: [] }, 'pm');
    expect(request).toEqual(BASE);
    expect(Object.keys(request)).not.toContain('recruiterId');
    expect(Object.keys(request)).not.toContain('candidateIds');
  });

  it('should carry the four opportunity fields', () => {
    const request = buildCreateProcessRequest({ data: BASE, candidates: [] }, 'pm');
    expect(request).toMatchObject({ opportunityRole: 'Backend Java', skills: ['Java', 'Spring'], roleDescription: 'Evaluar diseño de APIs.', band: 8 });
  });

  it('should refuse to build a request without band', () => {
    expect(() => buildCreateProcessRequest({ data: { ...BASE, band: undefined }, candidates: [] }, 'pm')).toThrow();
  });

  it('should send startDate only when one was chosen', () => {
    expect(buildCreateProcessRequest({ data: { ...BASE, startDate: '2026-12-01' }, candidates: [] }, 'pm')).toMatchObject({ startDate: '2026-12-01' });
    ['', undefined].forEach(startDate => {
      expect(Object.keys(buildCreateProcessRequest({ data: { ...BASE, startDate }, candidates: [] }, 'pm'))).not.toContain('startDate');
    });
  });
});
