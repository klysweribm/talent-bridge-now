import { render, screen, within } from '@testing-library/react';
import { AdditionalCandidateData } from './AdditionalCandidateData';

const DRAFT = {
  experience: [
    { company: 'Empresa Ficticia', role: 'Backend Dev', from: '2020-01', to: '2023-06', summary: 'Servicios en Java.' },
    { company: 'Otra Inventada', role: 'Analista' },
  ],
  education: [{ institution: 'Universidad Ficticia', degree: 'Ingeniería', year: 2015 }],
  languages: [{ code: 'en', level: 'advanced' }, { code: 'es', level: 'native' }],
} as const;

describe('AdditionalCandidateData', () => {
  it('should render nothing when the draft has no extra data', () => {
    const { container } = render(<AdditionalCandidateData draft={{ summary: 'solo resumen' }} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should render experience, education and languages under one labelled region', () => {
    render(<AdditionalCandidateData draft={DRAFT} />);
    expect(screen.getByRole('heading', { name: 'Datos adicionales del candidato' })).toBeInTheDocument();
    const experience = screen.getByRole('list', { name: 'Experiencia' });
    expect(within(experience).getAllByRole('listitem')).toHaveLength(2);
    expect(experience).toHaveTextContent('Backend Dev');
    expect(experience).toHaveTextContent('Empresa Ficticia');
    expect(experience).toHaveTextContent('2020-01 – 2023-06');
    expect(experience).toHaveTextContent('Servicios en Java.');
    expect(screen.getByRole('list', { name: 'Educación' })).toHaveTextContent(/Universidad Ficticia.*Ingeniería.*2015/s);
    const languages = screen.getByRole('list', { name: 'Idiomas' });
    expect(languages).toHaveTextContent(/inglés.*avanzado/is);
    expect(languages).toHaveTextContent(/español.*nativo/is);
  });

  it('should hide each empty sub-section', () => {
    render(<AdditionalCandidateData draft={{ languages: DRAFT.languages }} />);
    expect(screen.getByRole('list', { name: 'Idiomas' })).toBeInTheDocument();
    expect(screen.queryByRole('list', { name: 'Experiencia' })).not.toBeInTheDocument();
    expect(screen.queryByRole('list', { name: 'Educación' })).not.toBeInTheDocument();
  });

  it('should cope with partial entries without placeholder noise', () => {
    render(<AdditionalCandidateData draft={{ experience: [{ company: 'Solo Empresa' }], education: [{ year: 2010 }] }} />);
    expect(screen.getByRole('list', { name: 'Experiencia' })).toHaveTextContent('Solo Empresa');
    expect(screen.queryByText(/undefined/)).not.toBeInTheDocument();
  });
});
