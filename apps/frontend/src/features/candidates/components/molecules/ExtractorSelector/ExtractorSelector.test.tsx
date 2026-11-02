import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExtractorSelector } from './ExtractorSelector';

describe('ExtractorSelector', () => {
  it('should render the three modes with their helper text', () => {
    render(<ExtractorSelector value="ica-text" onChange={vi.fn()} />);
    expect(screen.getAllByRole('radio').map(r => r.closest('label')?.textContent ?? '')).toHaveLength(3);
    expect(screen.getByRole('radio', { name: /ica \(archivo\)/i })).not.toBeChecked();
    expect(screen.getByRole('radio', { name: /ica \(texto\)/i })).toBeChecked();
    expect(screen.getByRole('radio', { name: /clásica/i })).not.toBeChecked();
    expect(screen.getByText(/lee el cv con reglas locales y lo completa con ia si está disponible/i)).toBeInTheDocument();
  });

  it('should call onChange with the chosen mode', async () => {
    const onChange = vi.fn();
    render(<ExtractorSelector value="ica-text" onChange={onChange} />);
    await userEvent.setup().click(screen.getByRole('radio', { name: /clásica/i }));
    expect(onChange).toHaveBeenCalledWith('classic');
  });

  it('should disable every option when disabled', () => {
    render(<ExtractorSelector value="ica" onChange={vi.fn()} disabled />);
    screen.getAllByRole('radio').forEach(radio => expect(radio).toBeDisabled());
  });
});
