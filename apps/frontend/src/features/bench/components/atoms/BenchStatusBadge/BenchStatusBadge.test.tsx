import { render, screen } from '@testing-library/react';
import { BenchStatusBadge } from './BenchStatusBadge';

describe('BenchStatusBadge', () => {
  it.each([['available', 'Disponible'], ['soft_booked', 'Reserva tentativa'], ['assigned', 'Asignado']] as const)(
    'should render the Spanish label for %s',
    (status, label) => {
      render(<BenchStatusBadge status={status} />);
      expect(screen.getByText(label)).toBeInTheDocument();
    },
  );
});
