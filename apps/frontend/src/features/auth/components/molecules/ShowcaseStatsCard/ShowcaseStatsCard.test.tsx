import { render, screen } from '@testing-library/react';
import { ShowcaseStatsCard } from './ShowcaseStatsCard';
import { LOGIN_SHOWCASE } from '@features/auth/config/loginShowcase';

describe('ShowcaseStatsCard', () => {
  it('should render every illustrative statistic from the showcase constant', () => {
    render(<ShowcaseStatsCard />);
    LOGIN_SHOWCASE.stats.forEach(stat => {
      expect(screen.getByText(stat.value)).toBeInTheDocument();
      expect(screen.getByText(stat.caption)).toBeInTheDocument();
    });
  });
});
