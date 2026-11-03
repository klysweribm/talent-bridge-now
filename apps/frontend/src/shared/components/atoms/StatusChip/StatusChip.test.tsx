import { render, screen } from '@testing-library/react';
import type { TProcessStatus } from '@ibm-talent-bridge/shared-types';
import { PROCESS_STATUS_CHIP } from '@/config/processStatus';
import { StatusChip } from './StatusChip';

const CASES: readonly [TProcessStatus, string][] = [
  ['open', 'Abierto'], ['in_progress', 'Avanzando'], ['interviewing', 'Entrevista'], ['closed', 'Cerrado'], ['cancelled', 'Cancelado'],
];

describe('StatusChip', () => {
  it.each(CASES)('should always show the visible text for %s', (status, label) => {
    render(<StatusChip status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it.each(CASES)('should apply the token classes mapped to %s', (status, label) => {
    render(<StatusChip status={status} />);
    for (const cls of PROCESS_STATUS_CHIP[status].classes.split(' ')) expect(screen.getByText(label)).toHaveClass(cls);
  });

  it('should use a distinct color pair per status', () => {
    const pairs = new Set(CASES.map(([status]) => PROCESS_STATUS_CHIP[status].classes));
    expect(pairs.size).toBe(CASES.length);
  });

  it('should append a custom className', () => {
    render(<StatusChip status="open" className="ml-2" />);
    expect(screen.getByText('Abierto')).toHaveClass('ml-2');
  });
});
