import { useState, type KeyboardEvent } from 'react';
import { OPPORTUNITY_COPY } from '../config/processOpportunity.copy';

export interface IUseSkillDraft {
  readonly draft:      string;
  readonly notice:     string;
  readonly setDraft:   (value: string) => void;
  readonly onKeyDown:  (event: KeyboardEvent<HTMLInputElement>) => void;
  readonly remove:     (skill: string) => void;
}

const ADD_KEYS: readonly string[] = ['Enter', ','];
const isSame = (a: string, b: string): boolean => a.toLocaleLowerCase() === b.toLocaleLowerCase();

/** Estado local del campo de texto de tecnologías (borrador y aviso); la lista vive en quien lo usa. */
export function useSkillDraft(skills: readonly string[], onChange: (skills: readonly string[]) => void): IUseSkillDraft {
  const [draft, setDraftState] = useState('');
  const [notice, setNotice] = useState('');
  const commit = (): void => {
    const value = draft.trim();
    if (!value) return;
    if (skills.some(skill => isSame(skill, value))) { setNotice(OPPORTUNITY_COPY.skillDuplicate); return; }
    setNotice('');
    setDraftState('');
    onChange([...skills, value]);
  };
  return {
    draft, notice,
    setDraft: value => { setDraftState(value); setNotice(''); },
    onKeyDown: event => {
      if (!ADD_KEYS.includes(event.key)) return;
      event.preventDefault();
      commit();
    },
    remove: target => { setNotice(''); onChange(skills.filter(skill => skill !== target)); },
  };
}
