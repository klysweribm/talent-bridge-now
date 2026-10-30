import { render, screen } from '@testing-library/react';
import { ResourceSkillsSection } from './ResourceSkillsSection';

describe('ResourceSkillsSection', () => {
  it('should list each skill with level and years', () => {
    render(<ResourceSkillsSection skills={[{ name: 'Java', level: 5, years: 8 }]} />);
    expect(screen.getByText('Java')).toBeInTheDocument();
    expect(screen.getByText('Nivel 5 · 8 años')).toBeInTheDocument();
  });
});
