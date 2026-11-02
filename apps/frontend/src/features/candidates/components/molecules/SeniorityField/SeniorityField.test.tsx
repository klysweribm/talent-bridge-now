import { render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { describe, expect, it } from 'vitest';
import { SeniorityField } from './SeniorityField';

function Harness({ initial }: { readonly initial: '' | 'jr' | 'ssr' | 'sr' | 'lead' }): JSX.Element {
  const { register } = useForm<{ seniority: string }>({ defaultValues: { seniority: initial } });
  return <SeniorityField {...register('seniority')} />;
}

describe('SeniorityField', () => {
  it('should show the seniority seeded by react-hook-form when the draft has one', () => {
    render(<Harness initial="sr" />);

    expect(screen.getByLabelText('Seniority')).toHaveValue('sr');
  });

  it('should show "Sin definir" when the draft has no seniority', () => {
    render(<Harness initial="" />);

    expect(screen.getByLabelText('Seniority')).toHaveValue('');
  });

  it('should flag the field as missing with visible text, not only color', () => {
    render(<SeniorityField missing />);

    expect(screen.getByText(/No se detectó en el CV/)).toBeInTheDocument();
  });
});
