import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationRow } from './NotificationRow';

const BASE = { id: 'n1', title: 'Entrevista confirmada', body: 'Mañana 10:00', time: 'Hace 1 h', read: false };

describe('NotificationRow', () => {
  it('should highlight an unread notification and report the read on click', async () => {
    const onRead = vi.fn();
    render(<ul><NotificationRow notification={BASE} onRead={onRead} /></ul>);

    const row = screen.getByRole('button', { name: /Entrevista confirmada/ });
    expect(row).toHaveClass('bg-carbon-blue-10');
    await userEvent.click(row);
    expect(onRead).toHaveBeenCalledWith('n1');
  });

  it('should render a read notification on white', () => {
    render(<ul><NotificationRow notification={{ ...BASE, read: true }} onRead={vi.fn()} /></ul>);
    expect(screen.getByRole('button')).toHaveClass('bg-white');
  });
});
