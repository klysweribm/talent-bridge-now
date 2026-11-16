import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BRAND } from '@/config/brand';
import { HeaderBar, type HeaderBarProps } from './HeaderBar';

function setup(overrides: Partial<HeaderBarProps> = {}): HeaderBarProps {
  const props: HeaderBarProps = {
    userName: 'Ana Pérez', unreadCount: 3, activePanel: null,
    onToggleSearch: vi.fn(), onToggleNotifications: vi.fn(), ...overrides,
  };
  render(<HeaderBar {...props} />);
  return props;
}

describe('HeaderBar', () => {
  it('should show the brand, the unread badge and the user initials', () => {
    setup();

    expect(screen.getByText(BRAND.companyName)).toBeInTheDocument();
    expect(screen.getByText(BRAND.productShortName)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Notificaciones (3 sin leer)' })).toHaveTextContent('3');
    expect(screen.getByText('AP')).toBeInTheDocument();
  });

  it('should hide the badge when everything is read', () => {
    setup({ unreadCount: 0 });
    expect(screen.getByRole('button', { name: 'Notificaciones' })).toHaveTextContent('');
  });

  it('should call the toggles and expose aria-expanded', async () => {
    const props = setup({ activePanel: 'search' });

    expect(screen.getByRole('button', { name: 'Buscar' })).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(screen.getByRole('button', { name: 'Buscar' }));
    await userEvent.click(screen.getByRole('button', { name: /Notificaciones/ }));
    expect(props.onToggleSearch).toHaveBeenCalledTimes(1);
    expect(props.onToggleNotifications).toHaveBeenCalledTimes(1);
  });
});
