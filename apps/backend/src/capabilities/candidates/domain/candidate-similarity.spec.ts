import { PHONE_KEY_DIGITS, normalizeName, phoneKey } from './candidate-similarity';

describe('normalizeName', () => {
  it('should ignore case, diacritics and word order', () => {
    expect(normalizeName('Oliva Klyswer')).toBe(normalizeName('  klyswer   OLIVA '));
    expect(normalizeName('José Pérez')).toBe(normalizeName('perez jose'));
  });

  it('should drop non-letter characters', () => {
    expect(normalizeName("Ana-María O'Neil 3rd.")).toBe('ana maria neil o rd');
  });

  it('should return an empty string when there is no letter', () => {
    expect(normalizeName('')).toBe('');
    expect(normalizeName(' 123 - ')).toBe('');
  });
});

describe('phoneKey', () => {
  it('should keep the last digits regardless of formatting and prefix', () => {
    expect(phoneKey('+56 9 1234 5678')).toBe('12345678');
    expect(phoneKey('(09) 1234-5678')).toBe(phoneKey('+56 9 1234 5678'));
    expect(PHONE_KEY_DIGITS).toBe(8);
  });

  it('should return undefined when there are fewer digits than the key length', () => {
    expect(phoneKey('1234567')).toBeUndefined();
    expect(phoneKey(undefined)).toBeUndefined();
    expect(phoneKey('')).toBeUndefined();
  });
});
