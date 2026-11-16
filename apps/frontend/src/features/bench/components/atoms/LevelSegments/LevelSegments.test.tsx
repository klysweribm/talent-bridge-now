import { render, screen } from '@testing-library/react';
import { LevelSegments } from './LevelSegments';

describe('LevelSegments', () => {
  it('should fill only the first N of the total segments', () => {
    render(<LevelSegments filled={3} total={5} />);
    const segments = screen.getByTestId('level-segments').children;
    expect(segments).toHaveLength(5);
    expect(Array.from(segments).map(s => s.getAttribute('data-filled'))).toEqual(['true', 'true', 'true', 'false', 'false']);
  });
});
