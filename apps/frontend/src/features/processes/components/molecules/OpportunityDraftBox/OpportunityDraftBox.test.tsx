import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OpportunityDraftBox } from './OpportunityDraftBox';

const noop = (): void => undefined;

describe('OpportunityDraftBox', () => {
  it('should disable generate for blank text', () => {
    render(<OpportunityDraftBox text="   " isPending={false} onText={noop} onGenerate={noop} />);
    expect(screen.getByRole('button', { name: 'Generar con IA' })).toBeDisabled();
  });

  it('should call onGenerate and onText', async () => {
    const onGenerate = vi.fn();
    const onText = vi.fn();
    render(<OpportunityDraftBox text="hola" isPending={false} onText={onText} onGenerate={onGenerate} />);
    await userEvent.type(screen.getByLabelText('Describe la oportunidad con tus palabras'), 'a');
    expect(onText).toHaveBeenCalledWith('holaa');
    await userEvent.click(screen.getByRole('button', { name: 'Generar con IA' }));
    expect(onGenerate).toHaveBeenCalledTimes(1);
  });

  it('should show Generando… and be disabled while pending', () => {
    render(<OpportunityDraftBox text="hola" isPending onText={noop} onGenerate={noop} />);
    expect(screen.getByRole('button', { name: 'Generando…' })).toBeDisabled();
  });
});
