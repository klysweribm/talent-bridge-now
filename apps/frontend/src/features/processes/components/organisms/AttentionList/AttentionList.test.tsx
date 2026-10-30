import { screen } from '@testing-library/react';
import * as infra from '../../../infrastructure/processes.infra';
import { renderWithProviders } from '../../../test-utils';
import { AttentionList } from './AttentionList';

describe('AttentionList', () => {
  afterEach(() => { vi.restoreAllMocks(); });

  it('should list items needing attention', async () => {
    renderWithProviders(<AttentionList />);
    expect(await screen.findByText('Sin referente asignado')).toBeInTheDocument();
    expect(screen.getByText(/Feedback vencido hace 52 h/)).toBeInTheDocument();
  });

  it('should show "Todo al día" when there is nothing', async () => {
    vi.spyOn(infra, 'fetchAttentionItems').mockResolvedValue([]);
    renderWithProviders(<AttentionList />);
    expect(await screen.findByText('Todo al día')).toBeInTheDocument();
  });
});
