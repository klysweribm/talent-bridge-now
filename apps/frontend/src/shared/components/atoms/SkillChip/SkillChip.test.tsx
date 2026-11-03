import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SkillChip } from './SkillChip';

describe('SkillChip', () => {
  it('should render a read-only chip without a remove button', () => {
    render(<SkillChip label="Java" />);
    expect(screen.getByText('Java')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should call onRemove from the labelled × button', async () => {
    const onRemove = vi.fn();
    render(<SkillChip label="Java" onRemove={onRemove} removeLabel="Quitar Java" />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Quitar Java' }));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });
});
