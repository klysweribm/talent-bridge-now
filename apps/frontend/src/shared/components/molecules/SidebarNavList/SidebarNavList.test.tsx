import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NAVIGATION_ITEMS } from '@shared/config/navigation';
import { SidebarNavList } from './SidebarNavList';

describe('SidebarNavList', () => {
  it('should render one link per item and mark the active one', () => {
    render(
      <MemoryRouter initialEntries={['/bench']}>
        <SidebarNavList items={NAVIGATION_ITEMS.slice(0, 2)} />
      </MemoryRouter>,
    );

    expect(screen.getAllByRole('link')).toHaveLength(2);
    const active = screen.getByRole('link', { name: 'Banca' });
    expect(active).toHaveAttribute('aria-current', 'page');
    expect(active).toHaveClass('border-carbon-blue-60', 'font-semibold');
    expect(screen.getByRole('link', { name: 'Inicio' })).not.toHaveAttribute('aria-current');
  });
});
