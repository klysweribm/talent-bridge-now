import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { useAuthStore } from '@features/auth/store/auth.store';
import { buildSeedSlots } from '../../config/booking.constants';
import { useBookingStore } from '../../store/booking.store';
import { BookingPage } from './BookingPage';

const login = (role: 'recruiter' | 'technical_ref', email: string, name: string): void =>
  useAuthStore.getState().setAuth({ id: '1', email, name, role }, 't');

const renderPage = (): ReturnType<typeof render> => render(<MemoryRouter><BookingPage /></MemoryRouter>);

describe('BookingPage', () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
    useBookingStore.setState({ slots: buildSeedSlots() });
  });

  it('should show Mi disponibilidad to a technical_ref', () => {
    login('technical_ref', 'carlos@ibm.com', 'Carlos');
    renderPage();
    expect(screen.getByRole('heading', { name: 'Mi disponibilidad' })).toBeInTheDocument();
  });

  it('should let a recruiter list referents and book', async () => {
    login('recruiter', 'ana@ibm.com', 'Ana');
    renderPage();
    expect(screen.getByRole('heading', { name: 'Referentes disponibles' })).toBeInTheDocument();
    await userEvent.click(screen.getByText('Lucía Fernández'));
    await userEvent.click(screen.getAllByRole('button', { name: /^Reservar/ })[0]);
    expect(screen.getByText('Reservada por Ana')).toBeInTheDocument();
  });
});
