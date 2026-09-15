import { render, screen } from '@testing-library/react';
import { KpiCard } from './KpiCard';

describe('KpiCard', () => {
  it('should render label and value', () => {
    render(<KpiCard label="Procesos Activos" value={12} />);
    expect(screen.getByText('Procesos Activos')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('should set accessible aria-label combining label and value', () => {
    render(<KpiCard label="Candidatos" value={42} />);
    expect(screen.getByLabelText('Candidatos: 42')).toBeInTheDocument();
  });

  it('should render icon when icon prop is provided', () => {
    render(<KpiCard label="Entrevistas" value={5} icon="calendar_month" />);
    expect(screen.getByText('calendar_month')).toBeInTheDocument();
  });

  it('should NOT render trend section when trend prop is absent', () => {
    render(<KpiCard label="Total" value={10} />);
    expect(screen.queryByText('trending_up')).not.toBeInTheDocument();
    expect(screen.queryByText('trending_down')).not.toBeInTheDocument();
  });

  it('should render trend up icon and label', () => {
    render(<KpiCard label="Nuevos" value={8} trend="up" trendLabel="+3 esta semana" />);
    expect(screen.getByText('trending_up')).toBeInTheDocument();
    expect(screen.getByText('+3 esta semana')).toBeInTheDocument();
  });

  it('should render trend down icon and label', () => {
    render(<KpiCard label="Cierre" value={2} trend="down" trendLabel="-1 esta semana" />);
    expect(screen.getByText('trending_down')).toBeInTheDocument();
  });

  it('should NOT render trend label when trendLabel is absent but trend is set', () => {
    render(<KpiCard label="Total" value={5} trend="up" />);
    expect(screen.queryByText('trending_up')).not.toBeInTheDocument();
  });

  it('should render string value', () => {
    render(<KpiCard label="Estado" value="Activo" />);
    expect(screen.getByText('Activo')).toBeInTheDocument();
  });
});
