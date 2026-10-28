import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DashboardSection } from './DashboardSection';

describe('DashboardSection', () => {
  it('should render title, children and the see-all link when provided', () => {
    render(
      <MemoryRouter>
        <DashboardSection title="Titulo" headingId="h" seeAll={{ to: '/x', label: 'Ver todos' }}>contenido</DashboardSection>
      </MemoryRouter>,
    );
    expect(screen.getByRole('region', { name: 'Titulo' })).toHaveTextContent('contenido');
    expect(screen.getByRole('link', { name: 'Ver todos' })).toHaveAttribute('href', '/x');
  });

  it('should not render a link when seeAll is omitted', () => {
    render(<MemoryRouter><DashboardSection title="T" headingId="h">x</DashboardSection></MemoryRouter>);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
