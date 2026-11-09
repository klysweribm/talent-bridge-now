import { formatFileSize, formatSizeLimit } from './formatFileSize';

describe('formatFileSize', () => {
  it.each([
    [0, '0,0 KB'],
    [512, '0,5 KB'],
    [1536, '1,5 KB'],
    [102_400, '100,0 KB'],
    [1_048_576, '1,0 MB'],
    [7_549_747, '7,2 MB'],
  ])('should format %i bytes as %s', (bytes, expected) => {
    expect(formatFileSize(bytes)).toBe(expected);
  });
});

describe('formatSizeLimit', () => {
  it('should drop the decimal when the limit is a whole number of MB', () => {
    expect(formatSizeLimit(5 * 1024 * 1024)).toBe('5 MB');
  });

  it('should keep one decimal when the limit is not whole', () => {
    expect(formatSizeLimit(2.5 * 1024 * 1024)).toBe('2,5 MB');
  });
});
