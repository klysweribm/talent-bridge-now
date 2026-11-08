import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TodayInterviewsList } from './TodayInterviewsList';

describe('TodayInterviewsList', () => {
  it('should show an honest empty state and never claim there are no interviews today', () => {
    render(<MemoryRouter><TodayInterviewsList /></MemoryRouter>);
    expect(screen.getByRole('region', { name: 'Entrevistas de hoy' })).toBeInTheDocument();
    expect(screen.getByText('El agendamiento de entrevistas estará disponible próximamente')).toBeInTheDocument();
    expect(screen.queryByText(/no hay entrevistas/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });
});
