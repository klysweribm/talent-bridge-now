import { render, screen } from '@testing-library/react';
import { KpiStrip } from './KpiStrip';
import { KpiCard } from '../KpiCard';

describe('KpiStrip', () => {
  it('should render its KPI cells with their accessible labels', () => {
    render(<KpiStrip><KpiCard label="Activas" value={3} /><KpiCard label="Cerradas" value={1} /></KpiStrip>);
    expect(screen.getByRole('article', { name: 'Activas: 3' })).toBeInTheDocument();
    expect(screen.getByRole('article', { name: 'Cerradas: 1' })).toBeInTheDocument();
  });
});
