import { isValidEmail } from './isValidEmail';

describe('isValidEmail', () => {
  it.each([['persona@example.com', true], ['persona@', false], ['', false], [undefined, false]])('should return the right verdict for %s', (value, expected) => {
    expect(isValidEmail(value)).toBe(expected);
  });
});
