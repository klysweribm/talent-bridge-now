import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NAVIGATION_ITEMS } from '@shared/config/navigation';
import { SidebarNavList } from './SidebarNavList';

describe('SidebarNavList', () => {
  it('should render one link per item and mark the active one', () => {
    render(
      <MemoryRouter initialEntries={['/processes']}>
        <SidebarNavList items={NAVIGATION_ITEMS.slice(0, 2)} collapsed={false} />
      </MemoryRouter>,
    );

    expect(screen.getAllByRole('link')).toHaveLength(2);
    expect(screen.getByRole('link', { name: 'Procesos' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Inicio' })).not.toHaveAttribute('aria-current');
  });

  it('should hide labels but keep accessible names when collapsed', () => {
    render(
      <MemoryRouter><SidebarNavList items={NAVIGATION_ITEMS.slice(0, 1)} collapsed /></MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Inicio' })).toBeInTheDocument();
    expect(screen.getByText('Inicio')).toHaveClass('hidden');
  });
});
