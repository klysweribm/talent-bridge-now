import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SidebarHeader } from './SidebarHeader';

describe('SidebarHeader', () => {
  it('should show the brand and call onToggle', async () => {
    const onToggle = vi.fn();
    render(<SidebarHeader collapsed={false} onToggle={onToggle} />);

    expect(screen.getByText('IBM Talent Bridge')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Colapsar menú' }));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('should hide the brand text and offer to expand when collapsed', () => {
    render(<SidebarHeader collapsed onToggle={vi.fn()} />);

    expect(screen.getByText('IBM Talent Bridge')).toHaveClass('hidden');
    expect(screen.getByRole('button', { name: 'Expandir menú' })).toHaveAttribute('aria-expanded', 'false');
  });
});
