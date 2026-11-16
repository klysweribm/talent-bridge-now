import { render, screen } from '@testing-library/react';
import { InlineNotification } from './InlineNotification';

describe('InlineNotification', () => {
  it.each([['warning', 'alert'], ['error', 'alert'], ['info', 'status']] as const)(
    'should expose %s with the %s role by default', (kind, role) => {
      render(<InlineNotification kind={kind}>Mensaje</InlineNotification>);
      expect(screen.getByRole(role)).toHaveTextContent('Mensaje');
    },
  );

  it('should let the caller override the role', () => {
    render(<InlineNotification kind="warning" role="status">Aviso</InlineNotification>);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
