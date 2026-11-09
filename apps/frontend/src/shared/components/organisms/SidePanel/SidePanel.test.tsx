import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState, type ReactNode } from 'react';
import { SidePanel } from './SidePanel';
import { useSidePanel } from './SidePanelContext';

interface IHarnessProps {
  readonly onClose?: () => void;
  readonly guardClose?: () => boolean;
  readonly width?: 'md' | 'lg';
  readonly children?: ReactNode;
}

function Panel({ onClose = vi.fn(), guardClose, width = 'md', children }: IHarnessProps): JSX.Element {
  return (
    <SidePanel title="Detalle" titleId="t" closeLabel="Cerrar detalle" width={width}
      onClose={onClose} guardClose={guardClose}>
      {children ?? <button>Uno</button>}
    </SidePanel>
  );
}

const overlay = (): HTMLElement => screen.getByRole('dialog').parentElement as HTMLElement;

describe('SidePanel', () => {
  it('should expose a modal dialog named by its title', () => {
    render(<Panel />);
    const dialog = screen.getByRole('dialog', { name: 'Detalle' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveFocus();
  });

  it('should close from the button, Escape and the overlay', async () => {
    const onClose = vi.fn();
    render(<Panel onClose={onClose} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar detalle' }));
    await userEvent.keyboard('{Escape}');
    await userEvent.click(overlay());
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it('should not close when clicking inside the panel', async () => {
    const onClose = vi.fn();
    render(<Panel onClose={onClose} />);
    await userEvent.click(screen.getByRole('dialog'));
    await userEvent.click(screen.getByRole('button', { name: 'Uno' }));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('should block the three close paths when guardClose returns false', async () => {
    const onClose = vi.fn();
    const guardClose = vi.fn(() => false);
    render(<Panel onClose={onClose} guardClose={guardClose} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar detalle' }));
    await userEvent.keyboard('{Escape}');
    await userEvent.click(overlay());
    expect(guardClose).toHaveBeenCalledTimes(3);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('should close without consulting guardClose when a child calls forceClose', async () => {
    const onClose = vi.fn();
    const guardClose = vi.fn(() => false);
    function Discard(): JSX.Element {
      const { forceClose } = useSidePanel();
      return <button onClick={forceClose}>Descartar</button>;
    }
    render(<Panel onClose={onClose} guardClose={guardClose}><Discard /></Panel>);
    await userEvent.click(screen.getByRole('button', { name: 'Descartar' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(guardClose).not.toHaveBeenCalled();
  });

  it('should cycle focus with Tab and Shift+Tab', async () => {
    render(<Panel><button>Uno</button><button>Dos</button></Panel>);
    const close = screen.getByRole('button', { name: 'Cerrar detalle' });
    const dos = screen.getByRole('button', { name: 'Dos' });
    await userEvent.tab();
    expect(close).toHaveFocus();
    await userEvent.tab();
    await userEvent.tab();
    expect(dos).toHaveFocus();
    await userEvent.tab();
    expect(close).toHaveFocus();
    await userEvent.tab({ shift: true });
    expect(dos).toHaveFocus();
  });

  it('should recompute focusable elements when the content changes', async () => {
    function Phased(): JSX.Element {
      const [phase, setPhase] = useState<'a' | 'b'>('a');
      return (
        <Panel>
          {phase === 'a'
            ? <button onClick={() => setPhase('b')}>Siguiente</button>
            : <button>Revisar</button>}
        </Panel>
      );
    }
    render(<Phased />);
    await userEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    const revisar = screen.getByRole('button', { name: 'Revisar' });
    revisar.focus();
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Cerrar detalle' })).toHaveFocus();
    await userEvent.tab({ shift: true });
    expect(revisar).toHaveFocus();
    expect(screen.queryByRole('button', { name: 'Siguiente' })).not.toBeInTheDocument();
  });

  describe('with a nested alertdialog', () => {
    function WithConfirm({ onClose }: { readonly onClose: () => void }): JSX.Element {
      const [open, setOpen] = useState(true);
      return (
        <Panel onClose={onClose}>
          {open && (
            <div role="alertdialog" aria-label="Confirmar"
              onKeyDown={(e) => { if (e.key === 'Escape') { e.stopPropagation(); setOpen(false); } }}>
              <button>Descartar</button>
              <button>Seguir</button>
            </div>
          )}
        </Panel>
      );
    }

    it('should yield Tab handling to the alertdialog', async () => {
      render(<><WithConfirm onClose={vi.fn()} /><button>Fuera</button></>);
      const seguir = screen.getByRole('button', { name: 'Seguir' });
      seguir.focus();
      await userEvent.tab();
      // The panel trap does not wrap: the browser default moves on to the next element in the document.
      expect(screen.getByRole('button', { name: 'Fuera' })).toHaveFocus();
    });

    it('should close only the confirmation on Escape, keeping the panel open', async () => {
      const onClose = vi.fn();
      render(<WithConfirm onClose={onClose} />);
      screen.getByRole('button', { name: 'Seguir' }).focus();
      await userEvent.keyboard('{Escape}');
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  it('should focus the dialog on mount and return focus on close', () => {
    render(<button>Abrir</button>);
    screen.getByRole('button', { name: 'Abrir' }).focus();
    const { unmount } = render(<Panel />);
    expect(screen.getByRole('dialog')).toHaveFocus();
    unmount();
    expect(screen.getByRole('button', { name: 'Abrir' })).toHaveFocus();
  });

  it('should return focus to the element given by returnFocusTo', () => {
    render(<button>Fila</button>);
    const { unmount } = render(
      <SidePanel title="D" titleId="t" closeLabel="x" width="md" onClose={vi.fn()}
        returnFocusTo={() => screen.getByRole('button', { name: 'Fila' })}>
        <span>c</span>
      </SidePanel>,
    );
    unmount();
    expect(screen.getByRole('button', { name: 'Fila' })).toHaveFocus();
  });

  it('should lock body scroll while open and restore it exactly on unmount', () => {
    document.body.style.overflow = 'scroll';
    const { unmount } = render(<Panel />);
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).toBe('scroll');
    document.body.style.overflow = '';
  });

  it.each([['md', 'max-w-md'], ['lg', 'max-w-[640px]']] as const)(
    'should apply the %s width class',
    (width, cls) => {
      render(<Panel width={width} />);
      expect(screen.getByRole('dialog')).toHaveClass('w-full', cls);
    },
  );
});
