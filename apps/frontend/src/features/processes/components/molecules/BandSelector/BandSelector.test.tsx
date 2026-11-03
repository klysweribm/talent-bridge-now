import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { buildOpportunityBands } from '../../../config/processOpportunity.constants';
import { LIMITS_FIXTURE, makeLimits } from '../../../test-utils';
import { BandSelector } from './BandSelector';

const BANDS = buildOpportunityBands(LIMITS_FIXTURE.opportunity);

describe('BandSelector', () => {
  it('should offer exactly the integers of the band range as radios in a labelled group', () => {
    render(<BandSelector id="band" bands={BANDS} label="Banda" onChange={vi.fn()} />);
    expect(screen.getByRole('group', { name: 'Banda' })).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(BANDS.length);
    expect(screen.getByRole('radio', { name: 'Banda 6' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Banda 10' })).toBeInTheDocument();
  });

  it('should check the current value and report a click', async () => {
    const onChange = vi.fn();
    render(<BandSelector id="band" bands={BANDS} label="Banda" value={8} onChange={onChange} />);
    expect(screen.getByRole('radio', { name: 'Banda 8' })).toBeChecked();
    await userEvent.click(screen.getByRole('radio', { name: 'Banda 9' }));
    expect(onChange).toHaveBeenCalledWith(9);
  });

  it('should be operable with the keyboard', async () => {
    const onChange = vi.fn();
    render(<BandSelector id="band" bands={BANDS} label="Banda" value={6} onChange={onChange} />);
    await userEvent.tab();
    expect(screen.getByRole('radio', { name: 'Banda 6' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenCalledWith(7);
  });

  it('should keep a 44px touch target on every option and show the error', () => {
    render(<BandSelector id="band" bands={BANDS} label="Banda" error="Elige" onChange={vi.fn()} />);
    expect(screen.getByRole('radio', { name: 'Banda 7' }).closest('label')).toHaveClass('min-h-11');
    expect(screen.getByRole('alert')).toHaveTextContent('Elige');
  });

  it('should offer only the bands the server allows (6 to 8)', () => {
    render(<BandSelector id="band" bands={buildOpportunityBands(makeLimits({ opportunity: { bandMax: 8 } }).opportunity)} label="Banda" onChange={vi.fn()} />);
    expect(screen.getAllByRole('radio')).toHaveLength(3);
    expect(screen.queryByRole('radio', { name: 'Banda 9' })).not.toBeInTheDocument();
  });
});
