import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { describe, expect, it } from 'vitest';
import { CandidateTextAreaField } from './CandidateTextAreaField';

function Harness({ initial }: { readonly initial: string }): JSX.Element {
  const { register } = useForm<{ skills: string }>({ defaultValues: { skills: initial } });
  return <CandidateTextAreaField label="Skills" hint="Una por línea." {...register('skills')} />;
}

describe('CandidateTextAreaField', () => {
  it('should show the multi-line value seeded by react-hook-form', () => {
    render(<Harness initial={'AWS (EKS, Lambda)\nKafka'} />);

    expect(screen.getByLabelText('Skills')).toHaveValue('AWS (EKS, Lambda)\nKafka');
  });

  it('should let the user type several lines', async () => {
    render(<Harness initial="" />);

    await userEvent.type(screen.getByLabelText('Skills'), 'Rust{enter}Go');

    expect(screen.getByLabelText('Skills')).toHaveValue('Rust\nGo');
  });

  it('should expose the format hint to assistive technology', () => {
    render(<Harness initial="" />);

    expect(screen.getByLabelText('Skills')).toHaveAccessibleDescription('Una por línea.');
  });

  it('should show the error text and mark the field invalid', () => {
    render(<CandidateTextAreaField label="Skills" name="skills" error="Demasiadas skills." />);

    expect(screen.getByRole('alert')).toHaveTextContent('Demasiadas skills.');
    expect(screen.getByLabelText('Skills')).toBeInvalid();
  });

  it('should flag a missing field with visible text, not only colour', () => {
    render(<CandidateTextAreaField label="Skills" name="skills" missing />);

    expect(screen.getByText(/No se detectó en el CV/)).toBeInTheDocument();
  });
});
