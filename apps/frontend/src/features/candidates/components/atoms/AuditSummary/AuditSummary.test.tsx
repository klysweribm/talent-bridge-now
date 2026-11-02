import { render, screen } from '@testing-library/react';
import { AuditSummary } from './AuditSummary';

const actor = { id: 'u1', email: 'ana@ibm.com', role: 'recruiter' } as const;

describe('AuditSummary', () => {
  it('should show date, who updated it and how many times', () => {
    render(<AuditSummary updatedAt="2026-03-10T15:00:00.000Z" updatedBy={actor} updateCount={2} />);
    expect(screen.getByText('Última actualización: 10-03-2026')).toBeInTheDocument();
    expect(screen.getByText('por ana@ibm.com (Reclutador)')).toBeInTheDocument();
    expect(screen.getByText('Actualizado 2 veces')).toBeInTheDocument();
  });

  it('should say there is no record of who updated it when updatedBy is missing', () => {
    render(<AuditSummary updatedAt="2026-03-10T15:00:00.000Z" updateCount={0} />);
    expect(screen.getByText('Sin registro de quién lo actualizó')).toBeInTheDocument();
    expect(screen.getByText('Aún no se ha actualizado')).toBeInTheDocument();
  });
});
