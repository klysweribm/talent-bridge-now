import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CounterCard } from './CounterCard';

describe('CounterCard', () => {
  it('should render a link to the filtered list with label and value', () => {
    render(<MemoryRouter><CounterCard label="Entrevistas hoy" value={3} to="/interviews?date=today" icon="interviews" /></MemoryRouter>);
    const link = screen.getByRole('link', { name: 'Entrevistas hoy: 3' });
    expect(link).toHaveAttribute('href', '/interviews?date=today');
  });
});
