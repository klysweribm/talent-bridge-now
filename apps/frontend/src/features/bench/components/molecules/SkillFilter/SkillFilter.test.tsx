import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SkillFilter } from './SkillFilter';

describe('SkillFilter', () => {
  it('should offer only the skills that are not selected yet', () => {
    render(<SkillFilter options={['Java', 'Go']} selected={['Java']} onChange={vi.fn()} />);
    const select = screen.getByLabelText('Skills');
    expect(select).toHaveTextContent('Go');
    expect(select).not.toHaveTextContent('Java');
  });

  it('should add the picked skill to the selection', async () => {
    const onChange = vi.fn();
    render(<SkillFilter options={['Java', 'Go']} selected={['Java']} onChange={onChange} />);
    await userEvent.selectOptions(screen.getByLabelText('Skills'), 'Go');
    expect(onChange).toHaveBeenCalledWith(['Java', 'Go']);
  });

  it('should remove a selected skill from its chip', async () => {
    const onChange = vi.fn();
    render(<SkillFilter options={[]} selected={['Java', 'Go']} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Quitar Java' }));
    expect(onChange).toHaveBeenCalledWith(['Go']);
  });
});
