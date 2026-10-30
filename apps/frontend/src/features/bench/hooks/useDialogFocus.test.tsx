import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRef } from 'react';
import { useDialogFocus } from './useDialogFocus';

function Harness({ onClose }: { readonly onClose: () => void }): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  useDialogFocus(ref, '#opener', onClose);
  return <div ref={ref} tabIndex={-1} role="dialog">dialog</div>;
}

describe('useDialogFocus', () => {
  it('should focus the dialog on mount', () => {
    render(<Harness onClose={vi.fn()} />);
    expect(screen.getByRole('dialog')).toHaveFocus();
  });

  it('should call onClose when Escape is pressed', async () => {
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should return the focus to the opener on unmount', () => {
    render(<button id="opener">open</button>);
    const { unmount } = render(<Harness onClose={vi.fn()} />);
    unmount();
    expect(screen.getByRole('button', { name: 'open' })).toHaveFocus();
  });
});
