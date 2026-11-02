import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CandidateCheckbox } from './CandidateCheckbox';

describe('CandidateCheckbox', () => {
  it('should render a real checkbox labelled name · role and notify toggles', async () => {
    const onToggle = vi.fn();
    render(<CandidateCheckbox label="Ana · Dev" checked={false} disabled={false} onToggle={onToggle} />);
    await userEvent.click(screen.getByRole('checkbox', { name: 'Ana · Dev' }));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when asked', () => {
    render(<CandidateCheckbox label="Ana" checked={false} disabled onToggle={vi.fn()} />);
    expect(screen.getByRole('checkbox', { name: 'Ana' })).toBeDisabled();
  });
});
