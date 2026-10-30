import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AttentionRow } from './AttentionRow';

function setup(item: Parameters<typeof AttentionRow>[0]['item']): void {
  render(<MemoryRouter><ul><AttentionRow item={item} /></ul></MemoryRouter>);
}

describe('AttentionRow', () => {
  it('should describe a process without referent', () => {
    setup({ id: '1', kind: 'no_referent', processId: '5', processTitle: 'SRE' });
    expect(screen.getByText('Sin referente asignado')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Resolver' })).toHaveAttribute('href', '/processes/5');
  });

  it('should describe overdue feedback with hours and candidate', () => {
    setup({ id: '2', kind: 'overdue_feedback', processId: '1', processTitle: 'React', candidateName: 'Sergio', hoursOverdue: 52 });
    expect(screen.getByText(/Feedback vencido hace 52 h · Sergio/)).toBeInTheDocument();
  });
});
