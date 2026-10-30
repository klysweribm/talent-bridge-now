import { screen } from '@testing-library/react';
import * as infra from '../../../infrastructure/bench.infra';
import { makePage, makeResource, renderAt } from '../../../test-utils';
import { BenchCounter } from './BenchCounter';

vi.mock('../../../infrastructure/bench.infra');

describe('BenchCounter', () => {
  beforeEach(() => vi.resetAllMocks());

  it('should show the plural total', async () => {
    vi.mocked(infra.fetchBench).mockResolvedValue(makePage([makeResource()], { total: 12 }));
    renderAt(<BenchCounter />);
    expect(await screen.findByText('12 recursos en banca')).toBeInTheDocument();
  });

  it('should use the singular when there is one', async () => {
    vi.mocked(infra.fetchBench).mockResolvedValue(makePage([makeResource()]));
    renderAt(<BenchCounter />);
    expect(await screen.findByText('1 recurso en banca')).toBeInTheDocument();
  });
});
