import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SeniorityToggles } from './SeniorityToggles';

describe('SeniorityToggles', () => {
  it('should mark the selected levels as pressed', () => {
    render(<SeniorityToggles selected={['sr']} onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Sr' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Jr' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('should add a level when toggled on and remove it when toggled off', async () => {
    const onChange = vi.fn();
    const { rerender } = render(<SeniorityToggles selected={['sr']} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Lead' }));
    expect(onChange).toHaveBeenLastCalledWith(['sr', 'lead']);
    rerender(<SeniorityToggles selected={['sr']} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Sr' }));
    expect(onChange).toHaveBeenLastCalledWith([]);
  });
});
