import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { makeResource } from '../../../test-utils';
import { BenchTableRow } from './BenchTableRow';

function setup(onSelect = vi.fn()): typeof onSelect {
  render(<table><tbody><BenchTableRow resource={makeResource()} onSelect={onSelect} /></tbody></table>);
  return onSelect;
}

describe('BenchTableRow', () => {
  it('should render the resource columns with only the top 3 skills', () => {
    setup();
    expect(screen.getByText('Lucía Fernández')).toBeInTheDocument();
    expect(screen.getByText('Backend Developer')).toBeInTheDocument();
    expect(screen.getByText('Java · 5')).toBeInTheDocument();
    expect(screen.queryByText('SQL · 2')).not.toBeInTheDocument();
    expect(screen.getByText('Argentina')).toBeInTheDocument();
    expect(screen.getByText('Disponible ya')).toBeInTheDocument();
    expect(screen.getByText('Disponible')).toBeInTheDocument();
  });

  it('should select the resource from the code button', async () => {
    const onSelect = setup();
    await userEvent.click(screen.getByRole('button', { name: /BN-0001/ }));
    expect(onSelect).toHaveBeenCalledWith('BN-0001');
  });

  it('should select the resource with the keyboard', async () => {
    const onSelect = setup();
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledWith('BN-0001');
  });

  it('should select the resource when the row itself is clicked', async () => {
    const onSelect = setup();
    await userEvent.click(screen.getByText('Backend Developer'));
    expect(onSelect).toHaveBeenCalledWith('BN-0001');
  });
});
