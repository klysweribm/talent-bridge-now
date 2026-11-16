import { render, screen } from '@testing-library/react';
import { StageChip } from './StageChip';
import { STAGE_CHIP_STYLES, PROCESS_STAGES } from '@/config/design-tokens';

describe('StageChip', () => {
  it('should render label for "Inicial" stage', () => {
    render(<StageChip stage="Inicial" />);
    expect(screen.getByText('Inicial')).toBeInTheDocument();
  });

  it('should render label for "Entrevista Técnica" stage', () => {
    render(<StageChip stage="Entrevista Técnica" />);
    expect(screen.getByText('Entrevista Técnica')).toBeInTheDocument();
  });

  it.each(PROCESS_STAGES)('should apply the token classes from STAGE_CHIP_STYLES for %s', stage => {
    render(<StageChip stage={stage} />);
    const chip = screen.getByLabelText(`Etapa: ${STAGE_CHIP_STYLES[stage].label}`);
    for (const cls of STAGE_CHIP_STYLES[stage].classes.split(' ')) expect(chip).toHaveClass(cls);
    expect(chip).toHaveClass('rounded-pill');
  });

  it('should set aria-label with stage name', () => {
    render(<StageChip stage="Retroalimentación" />);
    expect(screen.getByLabelText('Etapa: Retroalimentación')).toBeInTheDocument();
  });

  it('should render all defined stages without throwing', () => {
    PROCESS_STAGES.forEach(stage => {
      const { unmount } = render(<StageChip stage={stage} />);
      unmount();
    });
  });
});
