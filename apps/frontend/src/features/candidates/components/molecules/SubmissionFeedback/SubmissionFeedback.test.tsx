import { render, screen } from '@testing-library/react';
import { SubmissionFeedback } from './SubmissionFeedback';
import { CandidateNotFoundError } from '../../../infrastructure/candidates.errors';

describe('SubmissionFeedback', () => {
  it('should render nothing without an error or update-of-existing note', () => {
    const { container } = render(<SubmissionFeedback error={null} isUpdate={false} fromDuplicate={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should show the create error as an alert', () => {
    render(<SubmissionFeedback error={new Error('x')} isUpdate={false} fromDuplicate={false} />);
    expect(screen.getByRole('alert')).toHaveTextContent('No pudimos crear el candidato');
  });

  it('should show the update error and the not-found message as alerts', () => {
    const { rerender } = render(<SubmissionFeedback error={new Error('x')} isUpdate fromDuplicate={false} />);
    expect(screen.getByRole('alert')).toHaveTextContent('No pudimos actualizar el candidato');
    rerender(<SubmissionFeedback error={new CandidateNotFoundError()} isUpdate fromDuplicate={false} />);
    expect(screen.getByRole('alert')).toHaveTextContent(/ya no existe/i);
  });

  it('should explain the email swap when updating an existing profile chosen after a duplicate', () => {
    render(<SubmissionFeedback error={null} isUpdate fromDuplicate />);
    expect(screen.getByRole('status')).toHaveTextContent('Se usará el correo del perfil existente');
  });
});
