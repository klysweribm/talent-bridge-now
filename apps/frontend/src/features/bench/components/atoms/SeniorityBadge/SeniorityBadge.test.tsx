import { render, screen } from '@testing-library/react';
import { SeniorityBadge } from './SeniorityBadge';

describe('SeniorityBadge', () => {
  it.each([['jr', 'Jr'], ['ssr', 'Ssr'], ['sr', 'Sr'], ['lead', 'Lead']] as const)(
    'should render the label of %s',
    (seniority, label) => {
      render(<SeniorityBadge seniority={seniority} />);
      expect(screen.getByText(label)).toBeInTheDocument();
    },
  );
});
