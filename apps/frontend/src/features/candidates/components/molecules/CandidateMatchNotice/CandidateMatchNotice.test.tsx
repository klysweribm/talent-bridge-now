import { render, screen, within } from '@testing-library/react';
import { CandidateMatchNotice } from './CandidateMatchNotice';

const base = { id: 'x1', fullName: 'Persona Inventada', updatedAt: '2026-03-10T15:00:00.000Z', updateCount: 2 } as const;
const actor = { id: 'u1', email: 'ana@ibm.com', role: 'recruiter' } as const;

describe('CandidateMatchNotice', () => {
  it('should render nothing without matches', () => {
    const { container } = render(<CandidateMatchNotice matches={{ similar: [] }} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should warn softly with a status role that the existing profile will be updated and replaced', () => {
    render(<CandidateMatchNotice matches={{ exact: { ...base, email: 'p@example.com', updatedBy: actor, reason: 'email' }, similar: [] }} />);
    const notice = screen.getByRole('status');
    expect(notice).toHaveTextContent('Este perfil ya existe y se va a actualizar al confirmar.');
    expect(notice).toHaveTextContent(/reemplazados por los valores del formulario/i);
    expect(within(notice).getByText(/Persona Inventada/)).toBeInTheDocument();
    expect(within(notice).getByText(/p@example\.com/)).toBeInTheDocument();
    expect(notice).toHaveTextContent('por ana@ibm.com (Reclutador)');
    expect(notice).toHaveTextContent('Actualizado 2 veces');
  });

  it('should list similar profiles with the Spanish reason and say creating is still allowed', () => {
    render(<CandidateMatchNotice matches={{ similar: [
      { ...base, email: 'a@example.com', reason: 'name' },
      { ...base, id: 'x2', fullName: 'Otra Inventada', email: 'b@example.com', reason: 'phone' },
    ] }} />);
    expect(screen.getByRole('heading', { name: 'Hay perfiles parecidos con otro correo' })).toBeInTheDocument();
    const items = screen.getAllByRole('listitem');
    expect(items[0]).toHaveTextContent('Persona Inventada · a@example.com · mismo nombre');
    expect(items[1]).toHaveTextContent('Otra Inventada · b@example.com · mismo teléfono');
    expect(screen.getByText('Puedes crear este candidato igualmente.')).toBeInTheDocument();
    expect(screen.queryByText(/se va a actualizar/i)).not.toBeInTheDocument();
  });
});
