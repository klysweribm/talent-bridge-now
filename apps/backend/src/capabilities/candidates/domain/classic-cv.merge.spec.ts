import type { ICandidateProfileDraft } from '@ibm-talent-bridge/shared-types';
import { mergeRulesWithIca } from './classic-cv.merge';

describe('mergeRulesWithIca', () => {
  it('should keep the rules value for contact fields and fill the rest from ICA, flagging the contribution', () => {
    const rules: ICandidateProfileDraft = { fullName: 'Regla Nombre', email: 'regla@example.test' };
    const ica: ICandidateProfileDraft = { fullName: 'Modelo Nombre', email: 'modelo@example.test', phone: '+1 555 0100', seniority: 'sr', summary: 'Resumen' };

    const merged = mergeRulesWithIca(rules, ica);

    expect(merged.draft).toEqual({ fullName: 'Regla Nombre', email: 'regla@example.test', phone: '+1 555 0100', seniority: 'sr', summary: 'Resumen' });
    expect(merged.contributed).toBe(true);
  });

  it('should add ICA skills missing from the rules skills, case-insensitively, keeping the rules ones first', () => {
    const merged = mergeRulesWithIca(
      { skills: [{ name: 'Java' }] },
      { skills: [{ name: 'java', level: 5 }, { name: 'Kafka' }] },
    );

    expect(merged.draft.skills).toEqual([{ name: 'Java' }, { name: 'Kafka' }]);
    expect(merged.contributed).toBe(true);
  });

  it('should not flag a contribution when ICA adds nothing new', () => {
    const merged = mergeRulesWithIca({ fullName: 'A B', skills: [{ name: 'Java' }] }, { fullName: 'Otro', skills: [{ name: 'JAVA' }] });

    expect(merged.draft).toEqual({ fullName: 'A B', skills: [{ name: 'Java' }] });
    expect(merged.contributed).toBe(false);
  });

  it('should fill a contact field from ICA when the rules left it empty', () => {
    expect(mergeRulesWithIca({}, { linkedIn: 'https://www.linkedin.com/in/x' }).draft.linkedIn).toBe('https://www.linkedin.com/in/x');
  });
});
