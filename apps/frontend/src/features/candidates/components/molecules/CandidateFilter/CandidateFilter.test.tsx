import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CandidateFilter } from './CandidateFilter';

describe('CandidateFilter', () => {
  it('should mark the active option with aria-pressed', () => {
    render(<CandidateFilter value="available" onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Disponibles' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Todos' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('should report the chosen assignment (undefined for Todos)', async () => {
    const onChange = vi.fn();
    render(<CandidateFilter value={undefined} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'En una oportunidad' }));
    expect(onChange).toHaveBeenLastCalledWith('assigned');
    expect(screen.getByRole('button', { name: 'Todos' })).toHaveAttribute('aria-pressed', 'true');
  });
});
