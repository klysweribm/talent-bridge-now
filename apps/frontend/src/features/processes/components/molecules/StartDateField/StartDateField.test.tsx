import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StartDateField } from './StartDateField';

const noop = (): void => undefined;

describe('StartDateField', () => {
  it('should show a labelled date input with its hint', () => {
    render(<StartDateField id="d" value="2026-12-01" onChange={noop} onBlur={noop} />);
    const input = screen.getByLabelText('Fecha de inicio');
    expect(input).toHaveAttribute('type', 'date');
    expect(input).toHaveValue('2026-12-01');
    expect(screen.getByText(/Opcional/)).toBeInTheDocument();
  });

  it('should report the typed date', async () => {
    const onChange = vi.fn();
    render(<StartDateField id="d" value="" onChange={onChange} onBlur={noop} />);
    await userEvent.type(screen.getByLabelText('Fecha de inicio'), '2026-12-01');
    expect(onChange).toHaveBeenCalled();
  });

  it('should show the error instead of the hint', () => {
    render(<StartDateField id="d" value="" error="Ingresa una fecha de inicio válida." onChange={noop} onBlur={noop} />);
    expect(screen.getByText('Ingresa una fecha de inicio válida.')).toBeInTheDocument();
    expect(screen.queryByText(/Opcional/)).not.toBeInTheDocument();
  });
});
