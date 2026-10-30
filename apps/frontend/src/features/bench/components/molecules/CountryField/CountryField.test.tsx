import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CountryField } from './CountryField';

describe('CountryField', () => {
  it('should offer the 7 countries plus "Todos" and report the choice', async () => {
    const onChange = vi.fn();
    render(<CountryField value={undefined} onChange={onChange} />);
    expect(screen.getAllByRole('option')).toHaveLength(8);
    await userEvent.selectOptions(screen.getByLabelText('País'), 'México');
    expect(onChange).toHaveBeenCalledWith('México');
  });
});
