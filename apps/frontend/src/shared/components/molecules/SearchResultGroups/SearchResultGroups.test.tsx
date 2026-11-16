import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchResultGroups } from './SearchResultGroups';

const GROUPS = [{
  id: 'bench', title: 'Recursos en banca',
  items: [{ id: '1', title: 'Lucía Fernández', sub: 'Backend Developer', meta: 'BN-0001', to: '/bench?resource=BN-0001' }],
}];

describe('SearchResultGroups', () => {
  it('should show the group title with its count and the item meta', () => {
    render(<SearchResultGroups groups={GROUPS} onSelect={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'Recursos en banca · 1' })).toBeInTheDocument();
    expect(screen.getByText('BN-0001')).toBeInTheDocument();
  });

  it('should report the destination of the clicked item', async () => {
    const onSelect = vi.fn();
    render(<SearchResultGroups groups={GROUPS} onSelect={onSelect} />);

    await userEvent.click(screen.getByRole('button', { name: /Lucía Fernández/ }));
    expect(onSelect).toHaveBeenCalledWith('/bench?resource=BN-0001');
  });
});
