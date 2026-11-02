import { buildCreateProcessRequest } from './buildCreateProcessRequest';

const CANDIDATES = [{ id: 'c1', fullName: 'Ana' }, { id: 'c2', fullName: 'Luis', primaryRole: 'QA' }];

describe('buildCreateProcessRequest', () => {
  it('should send ownerPmId and no recruiterId for a recruiter', () => {
    const state = { data: { title: 'T', clientName: 'C', ownerPmId: 'pm1', recruiterId: 'stale' }, candidates: CANDIDATES };
    expect(buildCreateProcessRequest(state, 'recruiter')).toEqual({ title: 'T', clientName: 'C', ownerPmId: 'pm1', candidateIds: ['c1', 'c2'] });
  });

  it('should send recruiterId and no ownerPmId for a PM that chose one', () => {
    const state = { data: { title: 'T', clientName: 'C', ownerPmId: 'stale', recruiterId: 'r1' }, candidates: CANDIDATES };
    expect(buildCreateProcessRequest(state, 'pm')).toEqual({ title: 'T', clientName: 'C', recruiterId: 'r1', candidateIds: ['c1', 'c2'] });
  });

  it('should omit recruiterId and candidateIds for a PM with neither', () => {
    const request = buildCreateProcessRequest({ data: { title: 'T', clientName: 'C', recruiterId: '' }, candidates: [] }, 'pm');
    expect(request).toEqual({ title: 'T', clientName: 'C' });
    expect(Object.keys(request)).toEqual(['title', 'clientName']);
  });
});
