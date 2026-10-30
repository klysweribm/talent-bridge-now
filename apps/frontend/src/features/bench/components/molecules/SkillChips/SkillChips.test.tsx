import { render, screen } from '@testing-library/react';
import { SkillChips } from './SkillChips';

const SKILLS = [
  { name: 'Java', level: 4, years: 5 }, { name: 'SQL', level: 3, years: 2 },
  { name: 'Go', level: 2, years: 1 }, { name: 'Rust', level: 1, years: 1 },
] as const;

describe('SkillChips', () => {
  it('should render each skill with its level', () => {
    render(<SkillChips skills={SKILLS.slice(0, 2)} />);
    expect(screen.getByText('Java · 4')).toBeInTheDocument();
    expect(screen.getByText('SQL · 3')).toBeInTheDocument();
  });

  it('should collapse the rest into "+N" when max is given', () => {
    render(<SkillChips skills={SKILLS} max={2} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByText('+2')).toBeInTheDocument();
    expect(screen.queryByText('Go · 2')).not.toBeInTheDocument();
  });

  it('should render a dash when there are no skills', () => {
    render(<SkillChips skills={[]} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});
