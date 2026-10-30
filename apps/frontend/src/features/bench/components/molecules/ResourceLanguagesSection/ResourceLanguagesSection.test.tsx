import { render, screen } from '@testing-library/react';
import { ResourceLanguagesSection } from './ResourceLanguagesSection';

describe('ResourceLanguagesSection', () => {
  it('should list each language with its Spanish level label', () => {
    render(<ResourceLanguagesSection languages={[{ code: 'en', level: 'advanced' }]} />);
    expect(screen.getByText('EN · Avanzado')).toBeInTheDocument();
  });
});
