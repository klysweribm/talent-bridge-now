import { VALID_DRAFT_JSON } from '../testing/cv-fixtures';
import { findMissingFields, sanitizeDraft } from './cv-draft.sanitizer';

describe('sanitizeDraft', () => {
  it('should keep every valid field and normalize the email to lowercase', () => {
    const { draft, dropped } = sanitizeDraft(VALID_DRAFT_JSON);

    expect(dropped).toBe(0);
    expect(draft).toEqual({ ...VALID_DRAFT_JSON, email: 'persona.inventada@example.test' });
  });

  it('should drop a seniority outside jr|ssr|sr|lead and count it', () => {
    const { draft, dropped } = sanitizeDraft({ fullName: 'A', seniority: 'god' });

    expect(draft).toEqual({ fullName: 'A' });
    expect(dropped).toBe(1);
  });

  it.each([
    ['email without a TLD', { email: 'admin@evil' }],
    ['email that is not a string', { email: 42 }],
    ['phone with letters', { phone: 'llámame ya' }],
    ['linkedIn that is not a LinkedIn URL', { linkedIn: 'https://evil.example/in/x' }],
    ['negative years', { yearsExperience: -3 }],
    ['absurd years', { yearsExperience: 900 }],
    ['non-object location', { location: 'Chile' }],
    ['empty strings', { fullName: '   ', primaryRole: '' }],
  ])('should drop %s', (_name, raw) => {
    expect(sanitizeDraft(raw).draft).toEqual({});
  });

  it('should discard unknown keys (the model can only propose schema fields)', () => {
    const { draft } = sanitizeDraft({ fullName: 'A', action: 'delete_all', role: 'admin', __proto__: { x: 1 } });

    expect(draft).toEqual({ fullName: 'A' });
  });

});

describe('sanitizeDraft lists and shapes', () => {
  it('should drop invalid items inside lists but keep the valid ones', () => {
    const { draft, dropped } = sanitizeDraft({
      skills: [{ name: 'Java', level: 9 }, { name: 'Kafka', level: 3 }, { level: 2 }, 'texto', null],
      languages: [{ code: 'ES', level: 'native' }, { code: 'es', level: 'godlike' }, { code: 'spanish', level: 'basic' }],
      education: [{ year: 'ayer' }, { institution: 'U', year: 2010 }],
    });

    expect(draft.skills).toEqual([{ name: 'Java' }, { name: 'Kafka', level: 3 }]);
    expect(draft.languages).toEqual([{ code: 'es', level: 'native' }]);
    expect(draft.education).toEqual([{ institution: 'U', year: 2010 }]);
    expect(dropped).toBeGreaterThan(0);
  });

  it('should cap oversized lists and strings', () => {
    const { draft } = sanitizeDraft({
      fullName: 'x'.repeat(5000),
      skills: Array.from({ length: 500 }, (_v, i) => ({ name: `s${i}` })),
    });

    expect(draft.fullName).toBeUndefined();
    expect(draft.skills?.length).toBeLessThanOrEqual(50);
  });

  it.each([[null], ['texto'], [[1, 2]], [undefined], [7]])('should return an empty draft for a non-object (%p)', (raw) => {
    expect(sanitizeDraft(raw).draft).toEqual({});
  });
});

describe('findMissingFields', () => {
  it('should list the draft fields that are absent or empty', () => {
    const missing = findMissingFields({ fullName: 'A', email: 'a@b.co', skills: [], languages: [{ code: 'es', level: 'basic' }] });

    expect(missing).toEqual(expect.arrayContaining(['phone', 'linkedIn', 'location', 'seniority', 'skills', 'education']));
    expect(missing).not.toContain('fullName');
    expect(missing).not.toContain('email');
    expect(missing).not.toContain('languages');
  });

  it('should return nothing for a complete draft', () => {
    expect(findMissingFields(sanitizeDraft(VALID_DRAFT_JSON).draft)).toEqual([]);
  });
});
