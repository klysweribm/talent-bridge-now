import { buildUpdateProcessRequest } from './buildUpdateProcessRequest';

const CURRENT = {
  title: 'T', clientName: 'C', opportunityRole: 'Dev', skills: ['Java'], roleDescription: 'd', band: 8 as number | undefined,
  startDate: undefined as string | undefined,
};

describe('buildUpdateProcessRequest startDate', () => {
  it('should send nothing when nothing changed', () => {
    expect(buildUpdateProcessRequest(CURRENT, { ...CURRENT, band: 8 })).toEqual({});
  });

  it('should send a new startDate', () => {
    expect(buildUpdateProcessRequest(CURRENT, { ...CURRENT, band: 8, startDate: '2026-12-01' })).toEqual({ startDate: '2026-12-01' });
  });

  it('should send a changed startDate', () => {
    const current = { ...CURRENT, startDate: '2026-12-01' };
    expect(buildUpdateProcessRequest(current, { ...current, band: 8, startDate: '2027-01-15' })).toEqual({ startDate: '2027-01-15' });
  });

  it('should not send an emptied startDate: the API cannot clear it', () => {
    const current = { ...CURRENT, startDate: '2026-12-01' };
    expect(buildUpdateProcessRequest(current, { ...current, band: 8, startDate: '' })).toEqual({});
  });
});
