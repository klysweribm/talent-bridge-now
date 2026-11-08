import { deriveDraftMarks } from './draftMarks';
import type { IAppliedDraft, IDraftCurrent } from './applyOpportunityDraft';

const CURRENT: IDraftCurrent = { title: 'T', clientName: '', opportunityRole: '', skills: ['A'], roleDescription: '' };
const RESULT: IAppliedDraft = { patch: { title: 'T', skills: ['A'] }, applied: ['title', 'skills'], skipped: [], missing: ['clientName'] };

describe('deriveDraftMarks', () => {
  it('should mark applied fields that still hold the applied value and empty missing fields', () => {
    expect(deriveDraftMarks(RESULT, CURRENT)).toEqual({ title: 'suggested', skills: 'suggested', clientName: 'missing' });
  });

  it('should drop the marks once the user edits or fills the field', () => {
    expect(deriveDraftMarks(RESULT, { ...CURRENT, title: 'T2', skills: ['A', 'B'], clientName: 'X' })).toEqual({});
  });

  it('should be empty without a result', () => {
    expect(deriveDraftMarks(undefined, CURRENT)).toEqual({});
  });
});
