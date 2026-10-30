import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AvailableByField } from './AvailableByField';

describe('AvailableByField', () => {
  it('should show the value and report a typed date', async () => {
    const onChange = vi.fn();
    render(<AvailableByField value="2026-11-05" onChange={onChange} />);
    expect(screen.getByLabelText('Disponible antes de')).toHaveValue('2026-11-05');
    await userEvent.clear(screen.getByLabelText('Disponible antes de'));
    expect(onChange).toHaveBeenCalledWith(undefined);
  });
});
