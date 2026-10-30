import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SelectedSkillChips } from './SelectedSkillChips';

describe('SelectedSkillChips', () => {
  it('should render nothing when there are no skills', () => {
    const { container } = render(<SelectedSkillChips skills={[]} onRemove={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should report the removed skill', async () => {
    const onRemove = vi.fn();
    render(<SelectedSkillChips skills={['Java']} onRemove={onRemove} />);
    await userEvent.click(screen.getByRole('button', { name: 'Quitar Java' }));
    expect(onRemove).toHaveBeenCalledWith('Java');
  });
});
