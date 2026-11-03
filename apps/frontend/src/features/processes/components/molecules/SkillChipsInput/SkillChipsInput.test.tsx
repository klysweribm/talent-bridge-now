import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OPPORTUNITY_LIMITS } from '../../../config/processOpportunity.constants';
import { SkillChipsInput } from './SkillChipsInput';

function Harness({ initial = [], error }: { readonly initial?: readonly string[]; readonly error?: string }): JSX.Element {
  const [skills, setSkills] = useState<readonly string[]>(initial);
  return <SkillChipsInput id="skills" label="Stack" skills={skills} error={error} hint="ayuda" onChange={setSkills} />;
}
const chips = (): string[] => screen.queryAllByRole('listitem').map(item => item.textContent ?? '');

describe('SkillChipsInput', () => {
  it('should add a skill with Enter and clear the input', async () => {
    render(<Harness />);
    await userEvent.type(screen.getByLabelText('Stack'), 'Java{Enter}');
    expect(chips()).toEqual(['Java']);
    expect(screen.getByLabelText('Stack')).toHaveValue('');
  });

  it('should add a skill with a comma without writing the comma', async () => {
    render(<Harness />);
    await userEvent.type(screen.getByLabelText('Stack'), 'Spring,');
    expect(chips()).toEqual(['Spring']);
    expect(screen.getByLabelText('Stack')).toHaveValue('');
  });

  it('should ignore blank input', async () => {
    render(<Harness />);
    await userEvent.type(screen.getByLabelText('Stack'), '   {Enter}');
    expect(chips()).toEqual([]);
  });

  it('should remove a skill with its × button', async () => {
    render(<Harness initial={['Java', 'Go']} />);
    await userEvent.click(screen.getByRole('button', { name: 'Quitar Java' }));
    expect(chips()).toEqual(['Go']);
  });

  it('should reject a case-insensitive duplicate and tell the user', async () => {
    render(<Harness initial={['Java']} />);
    await userEvent.type(screen.getByLabelText('Stack'), 'JAVA{Enter}');
    expect(chips()).toEqual(['Java']);
    expect(screen.getByRole('status')).toHaveTextContent('Esa tecnología ya está en la lista.');
  });

  it('should disable the input and announce the limit when the cap is reached', () => {
    const full = Array.from({ length: OPPORTUNITY_LIMITS.skillsMax }, (_, index) => `S${index}`);
    render(<Harness initial={full} />);
    expect(screen.getByLabelText('Stack')).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent(`${OPPORTUNITY_LIMITS.skillsMax} tecnologías`);
  });

  it('should cap the text length of one skill', () => {
    render(<Harness />);
    expect(screen.getByLabelText('Stack')).toHaveAttribute('maxlength', String(OPPORTUNITY_LIMITS.skillMax));
  });

  it('should expose label, list, hint and error accessibly', () => {
    const { rerender } = render(<Harness initial={['Java']} />);
    expect(screen.getByRole('list', { name: 'Tecnologías agregadas' })).toBeInTheDocument();
    expect(screen.getByLabelText('Stack')).toHaveAccessibleDescription('ayuda');
    rerender(<Harness initial={['Java']} error="Falta" />);
    expect(screen.getByLabelText('Stack')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Falta');
  });
});
