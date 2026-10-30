import { render, screen } from '@testing-library/react';
import { makeResource } from '../../../test-utils';
import { ResourceDetailSections } from './ResourceDetailSections';

describe('ResourceDetailSections', () => {
  it('should show skills with level and years, languages, location and dates', () => {
    render(<ResourceDetailSections resource={makeResource()} />);
    expect(screen.getByText('Java')).toBeInTheDocument();
    expect(screen.getByText('Nivel 5 · 8 años')).toBeInTheDocument();
    expect(screen.getByText('ES · Nativo')).toBeInTheDocument();
    expect(screen.getByText('EN · Avanzado')).toBeInTheDocument();
    expect(screen.getByText('Córdoba, Argentina')).toBeInTheDocument();
    expect(screen.getByText('10/01/2026')).toBeInTheDocument();
    expect(screen.getByText('Disponible ya')).toBeInTheDocument();
    expect(screen.getByText('Disponible')).toBeInTheDocument();
  });

  it('should use the singular for one year', () => {
    render(<ResourceDetailSections resource={makeResource({ skills: [{ name: 'Go', level: 1, years: 1 }] })} />);
    expect(screen.getByText('Nivel 1 · 1 año')).toBeInTheDocument();
  });
});
