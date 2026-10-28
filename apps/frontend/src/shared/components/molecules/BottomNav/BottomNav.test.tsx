import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NAVIGATION_ITEMS } from '@shared/config/navigation';
import { BottomNav, BOTTOM_NAV_MAX_ITEMS } from './BottomNav';

describe('BottomNav', () => {
  it('should render the role items using the mobile labels', () => {
    render(<MemoryRouter><BottomNav items={NAVIGATION_ITEMS.slice(0, 3)} /></MemoryRouter>);

    expect(screen.getAllByRole('link')).toHaveLength(3);
    expect(screen.getByText('Agenda')).toBeInTheDocument();
  });

  it('should render at most four items', () => {
    render(<MemoryRouter><BottomNav items={NAVIGATION_ITEMS} /></MemoryRouter>);

    expect(NAVIGATION_ITEMS.length).toBeGreaterThan(BOTTOM_NAV_MAX_ITEMS);
    expect(screen.getAllByRole('link')).toHaveLength(BOTTOM_NAV_MAX_ITEMS);
  });
});
