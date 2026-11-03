import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SelectField } from './SelectField';

const OPTIONS = [{ id: 'u1', fullName: 'Ana' }, { id: 'u2', fullName: 'Luis' }];

describe('SelectField', () => {
  it('should render label, placeholder and options and report the chosen id', async () => {
    const onChange = vi.fn();
    render(<SelectField id="pm" label="PM" placeholder="Elige" options={OPTIONS} value="" onChange={onChange} onBlur={vi.fn()} />);
    expect(screen.getByRole('option', { name: 'Elige' })).toBeInTheDocument();
    await userEvent.selectOptions(screen.getByLabelText('PM'), 'u2');
    expect(onChange).toHaveBeenCalledWith('u2');
  });

  it('should expose the error as text linked with aria-describedby', () => {
    render(<SelectField id="pm" label="PM" placeholder="Elige" options={OPTIONS} value="" error="Obligatorio" onChange={vi.fn()} onBlur={vi.fn()} />);
    const select = screen.getByLabelText('PM');
    expect(select).toHaveAttribute('aria-invalid', 'true');
    expect(select).toHaveAccessibleDescription('Obligatorio');
  });
});
