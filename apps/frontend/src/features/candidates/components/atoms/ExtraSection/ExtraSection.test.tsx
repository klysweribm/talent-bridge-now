import { render, screen } from '@testing-library/react';
import { ExtraSection } from './ExtraSection';

describe('ExtraSection', () => {
  it('should expose a heading and a list named after it', () => {
    render(<ExtraSection title="Experiencia"><li>uno</li></ExtraSection>);
    expect(screen.getByRole('heading', { name: 'Experiencia' })).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Experiencia' })).toHaveTextContent('uno');
  });
});
