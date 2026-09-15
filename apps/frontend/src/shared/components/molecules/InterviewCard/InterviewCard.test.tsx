import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InterviewCard } from './InterviewCard';

const DEFAULT_PROPS = {
  candidateName: 'Juan Pérez',
  role:          'Backend Engineer',
  stage:         'Entrevista Técnica' as const,
  date:          '2024-07-15',
  time:          '10:00',
  referentName:  'Ana García',
};

describe('InterviewCard', () => {
  it('should render candidate name', () => {
    render(<InterviewCard {...DEFAULT_PROPS} />);
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
  });

  it('should render role', () => {
    render(<InterviewCard {...DEFAULT_PROPS} />);
    expect(screen.getByText('Backend Engineer')).toBeInTheDocument();
  });

  it('should render stage chip', () => {
    render(<InterviewCard {...DEFAULT_PROPS} />);
    expect(screen.getByLabelText('Etapa: Entrevista Técnica')).toBeInTheDocument();
  });

  it('should render date and time', () => {
    render(<InterviewCard {...DEFAULT_PROPS} />);
    expect(screen.getByText('2024-07-15')).toBeInTheDocument();
    expect(screen.getByText('10:00')).toBeInTheDocument();
  });

  it('should render referent name', () => {
    render(<InterviewCard {...DEFAULT_PROPS} />);
    expect(screen.getByText('Ana García')).toBeInTheDocument();
  });

  it('should set aria-label combining candidate name', () => {
    render(<InterviewCard {...DEFAULT_PROPS} />);
    expect(screen.getByLabelText('Entrevista con Juan Pérez')).toBeInTheDocument();
  });

  it('should call onClick when clicked and onClick is provided', async () => {
    const handleClick = vi.fn();
    render(<InterviewCard {...DEFAULT_PROPS} onClick={handleClick} />);
    await userEvent.click(screen.getByLabelText('Entrevista con Juan Pérez'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('should call onClick when Enter is pressed on clickable card', async () => {
    const handleClick = vi.fn();
    render(<InterviewCard {...DEFAULT_PROPS} onClick={handleClick} />);
    const card = screen.getByLabelText('Entrevista con Juan Pérez');
    card.focus();
    await userEvent.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('should NOT be a button role when onClick is absent', () => {
    render(<InterviewCard {...DEFAULT_PROPS} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
