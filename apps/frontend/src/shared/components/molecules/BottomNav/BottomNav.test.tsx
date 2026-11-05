import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NAVIGATION_ITEMS } from '@shared/config/navigation';
import { BottomNav, BOTTOM_NAV_MAX_ITEMS } from './BottomNav';

describe('BottomNav', () => {
  it('should render the role items using the mobile labels', () => {
    render(<MemoryRouter><BottomNav items={NAVIGATION_ITEMS.filter(item => ['/dashboard', '/processes', '/interviews'].includes(item.path))} /></MemoryRouter>);

    expect(screen.getAllByRole('link')).toHaveLength(3);
    expect(screen.getByText('Agenda')).toBeInTheDocument();
  });

  it('should render at most five items', () => {
    render(<MemoryRouter><BottomNav items={NAVIGATION_ITEMS} /></MemoryRouter>);

    expect(NAVIGATION_ITEMS.length).toBeGreaterThan(BOTTOM_NAV_MAX_ITEMS);
    expect(screen.getAllByRole('link')).toHaveLength(BOTTOM_NAV_MAX_ITEMS);
  });
});

describe('BottomNav with a recruiter', () => {
  it('should cap the six recruiter items at five', () => {
    const items = NAVIGATION_ITEMS.filter(item => item.roles.includes('recruiter'));
    render(<MemoryRouter><BottomNav items={items} /></MemoryRouter>);

    expect(items).toHaveLength(6);
    expect(screen.getAllByRole('link')).toHaveLength(BOTTOM_NAV_MAX_ITEMS);
  });
});

describe('BottomNav content per role', () => {
  const labelsFor = (role: 'recruiter' | 'pm' | 'technical_ref'): string[] => {
    const items = NAVIGATION_ITEMS.filter(item => item.roles.includes(role));
    const { unmount } = render(<MemoryRouter><BottomNav items={items} /></MemoryRouter>);
    const labels = screen.getAllByRole('link').map(link => link.getAttribute('aria-label') ?? '');
    unmount();
    return labels;
  };

  it('should leave Reportes out for the recruiter on mobile', () => {
    expect(labelsFor('recruiter')).toEqual(['Inicio', 'Banca', 'Oportunidades', 'Candidatos', 'Entrevistas']);
  });

  it('should show five items for the PM including Candidatos and Reportes', () => {
    expect(labelsFor('pm')).toEqual(['Inicio', 'Banca', 'Oportunidades', 'Candidatos', 'Reportes']);
  });

  it('should not show Candidatos to the technical referent', () => {
    expect(labelsFor('technical_ref')).toEqual(['Inicio', 'Entrevistas', 'Feedback']);
  });
});
