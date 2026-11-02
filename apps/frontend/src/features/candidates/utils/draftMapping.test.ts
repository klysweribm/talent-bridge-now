import { describe, expect, it } from 'vitest';
import type { ICandidateProfileDraft } from '@ibm-talent-bridge/shared-types';
import { draftToFormValues, EMPTY_FORM_VALUES, formValuesToRequest } from './draftMapping';

const BASE = { fullName: 'Persona Inventada', email: 'persona@example.test' } as const;

describe('draftToFormValues', () => {
  it('should map every editable field and default the missing ones to empty text', () => {
    const values = draftToFormValues({
      ...BASE, phone: '+56 9 0000 0000', location: { country: 'Chile', city: 'Santiago' },
      primaryRole: 'Backend', seniority: 'sr', yearsExperience: 8, summary: 'Resumen',
    });

    expect(values).toMatchObject({
      fullName: 'Persona Inventada', email: 'persona@example.test', phone: '+56 9 0000 0000',
      country: 'Chile', city: 'Santiago', primaryRole: 'Backend', seniority: 'sr', yearsExperience: '8', summary: 'Resumen',
      linkedIn: '',
    });
  });

  it('should fall back to "Sin definir" for a seniority outside the closed list', () => {
    const values = draftToFormValues({ ...BASE, seniority: 'principal' as never });

    expect(values.seniority).toBe('');
  });

  it('should put one skill per line so names containing commas stay intact', () => {
    const values = draftToFormValues({ ...BASE, skills: [{ name: 'AWS (EKS, Lambda, Bedrock, SQS, SNS)' }, { name: 'Node.js / NestJS' }] });

    expect(values.skills).toBe('AWS (EKS, Lambda, Bedrock, SQS, SNS)\nNode.js / NestJS');
  });

  it('should return the empty form for an empty draft', () => {
    expect(draftToFormValues({})).toEqual(EMPTY_FORM_VALUES);
  });
});

describe('formValuesToRequest', () => {
  const draft: ICandidateProfileDraft = {
    ...BASE,
    skills: [{ name: 'AWS (EKS, Lambda, Bedrock, SQS, SNS)', level: 4, years: 6 }, { name: 'Kafka' }],
    languages: [{ code: 'es', level: 'native' }],
    education: [{ institution: 'Universidad Inventada', year: 2012 }],
    experience: [{ company: 'Empresa Inventada', role: 'Dev' }],
  };

  it('should keep a skill whose name contains commas as ONE skill, with its level and years', () => {
    const request = formValuesToRequest(draftToFormValues(draft), draft);

    expect(request.skills).toEqual([{ name: 'AWS (EKS, Lambda, Bedrock, SQS, SNS)', level: 4, years: 6 }, { name: 'Kafka' }]);
  });

  it('should round-trip the draft untouched when the user edits nothing', () => {
    const request = formValuesToRequest(draftToFormValues(draft), draft);

    expect(request).toMatchObject({ fullName: BASE.fullName, email: BASE.email, languages: draft.languages, education: draft.education, experience: draft.experience });
  });

  it('should add a skill typed on a new line and drop one the user deleted', () => {
    const values = { ...draftToFormValues(draft), skills: 'Kafka\nRust' };

    expect(formValuesToRequest(values, draft).skills).toEqual([{ name: 'Kafka' }, { name: 'Rust' }]);
  });

  it('should ignore blank lines and surrounding spaces in the skills field', () => {
    const values = { ...draftToFormValues(draft), skills: '  Kafka  \n\n   \nRust\n' };

    expect(formValuesToRequest(values, draft).skills?.map(skill => skill.name)).toEqual(['Kafka', 'Rust']);
  });

  it('should send undefined, not an empty string, for blank optional fields', () => {
    const request = formValuesToRequest({ ...EMPTY_FORM_VALUES, fullName: ' Ana ', email: ' a@b.co ' }, {});

    expect(request).toMatchObject({ fullName: 'Ana', email: 'a@b.co', phone: undefined, linkedIn: undefined, summary: undefined, location: undefined });
  });

  it('should send the location when only one of country or city is filled', () => {
    expect(formValuesToRequest({ ...EMPTY_FORM_VALUES, fullName: 'A', email: 'a@b.co', country: 'Chile' }, {}).location).toEqual({ country: 'Chile', city: undefined });
  });

  it('should convert yearsExperience to a number and omit it when blank', () => {
    const base = { ...EMPTY_FORM_VALUES, fullName: 'A', email: 'a@b.co' };

    expect(formValuesToRequest({ ...base, yearsExperience: '10' }, {}).yearsExperience).toBe(10);
    expect(formValuesToRequest(base, {}).yearsExperience).toBeUndefined();
  });
});
