import type { IOpportunityDraftFields } from '@ibm-talent-bridge/shared-types';
import { applyOpportunityDraft, type IDraftCurrent } from './applyOpportunityDraft';

const EMPTY: IDraftCurrent = { title: '', clientName: '', opportunityRole: '', skills: [], roleDescription: '', band: undefined, startDate: undefined };
const FULL: IOpportunityDraftFields = {
  title: 'T', clientName: 'ITAU', opportunityRole: 'Fullstack', skills: ['React', 'NestJS'], roleDescription: 'D', band: 8, startDate: '2026-12-01',
};

describe('applyOpportunityDraft', () => {
  it('should apply every proposed field when the form is empty', () => {
    const result = applyOpportunityDraft(FULL, [], EMPTY);
    expect(result.patch).toEqual({ ...FULL, skills: ['React', 'NestJS'] });
    expect(result.applied).toHaveLength(7);
    expect(result.skipped).toEqual([]);
    expect(result.missing).toEqual([]);
  });

  it('should never overwrite a field the user already filled and list it as skipped', () => {
    const current = { ...EMPTY, title: 'Mío', skills: ['Java'], band: 7, startDate: '2027-01-01' };
    const result = applyOpportunityDraft(FULL, [], current);
    expect(result.patch).toEqual({ clientName: 'ITAU', opportunityRole: 'Fullstack', roleDescription: 'D' });
    expect([...result.skipped].sort()).toEqual(['band', 'skills', 'startDate', 'title']);
  });

  it('should treat whitespace-only text as empty', () => {
    expect(applyOpportunityDraft(FULL, [], { ...EMPTY, title: '   ' }).patch.title).toBe('T');
  });

  it('should ignore null band and startDate and report them as missing', () => {
    const result = applyOpportunityDraft({ ...FULL, band: null, startDate: null }, ['band'], EMPTY);
    expect(result.patch).not.toHaveProperty('band');
    expect(result.patch).not.toHaveProperty('startDate');
    expect(result.skipped).toEqual([]);
    expect([...result.missing].sort()).toEqual(['band', 'startDate']);
  });

  it('should report empty strings and empty arrays from the draft as missing, not applied', () => {
    const result = applyOpportunityDraft({ ...FULL, clientName: '', skills: [] }, ['clientName'], EMPTY);
    expect(result.patch).not.toHaveProperty('clientName');
    expect(result.patch).not.toHaveProperty('skills');
    expect([...result.missing].sort()).toEqual(['clientName', 'skills']);
  });

  it('should not mark as missing a field the user already filled', () => {
    const result = applyOpportunityDraft({ ...FULL, clientName: '' }, ['clientName'], { ...EMPTY, clientName: 'Banco' });
    expect(result.missing).toEqual([]);
  });
});
