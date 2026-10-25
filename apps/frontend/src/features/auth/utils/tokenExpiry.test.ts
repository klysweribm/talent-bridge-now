import { getTokenExpiryMs, isTokenExpired } from './tokenExpiry';
import { makeJwt } from '../../../test/makeJwt';

const NOW_S = 1_800_000_000;
const NOW_MS = NOW_S * 1000;
const b64url = (obj: unknown): string =>
  btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const withPayload = (payload: string): string => `h.${payload}.s`;

describe('tokenExpiry', () => {
  it('should return exp in ms when the token is a valid JWT', () => {
    expect(getTokenExpiryMs(makeJwt(NOW_S))).toBe(NOW_MS);
  });

  it('should not be expired when exp is in the future', () => {
    expect(isTokenExpired(makeJwt(NOW_S + 60), NOW_MS)).toBe(false);
  });

  it('should be expired when exp is in the past', () => {
    expect(isTokenExpired(makeJwt(NOW_S - 1), NOW_MS)).toBe(true);
  });

  it('should be expired when now equals exactly exp', () => {
    expect(isTokenExpired(makeJwt(NOW_S), NOW_MS)).toBe(true);
  });

  it.each([
    ['not 3 segments', 'abc.def'],
    ['empty string', ''],
    ['bad base64', 'h.@@@!!.s'],
    ['non-JSON payload', withPayload(btoa('not json').replace(/=+$/, ''))],
    ['JSON that is not an object', withPayload(b64url(42))],
  ])('should treat the token as expired (fail closed) when it is malformed: %s', (_label, token) => {
    expect(getTokenExpiryMs(token)).toBeNull();
    expect(isTokenExpired(token, NOW_MS)).toBe(true);
  });

  it('should treat the token as expired when the payload has no exp', () => {
    const token = withPayload(b64url({ sub: 'u1' }));
    expect(getTokenExpiryMs(token)).toBeNull();
    expect(isTokenExpired(token, NOW_MS)).toBe(true);
  });

  it('should treat the token as expired when exp is not numeric', () => {
    expect(isTokenExpired(withPayload(b64url({ exp: '9999999999' })), NOW_MS)).toBe(true);
  });

  it('should decode base64url characters - and _ when the payload contains them', () => {
    // '???>>>' en base64 estándar produce '+' y '/'; base64url los cambia por '-' y '_'.
    const token = makeJwt(NOW_S + 60, { note: '???>>>~~~' });
    const payload = token.split('.')[1];
    expect(/[-_]/.test(payload)).toBe(true);
    expect(getTokenExpiryMs(token)).toBe((NOW_S + 60) * 1000);
  });

  it('should decode the payload when base64 padding is missing', () => {
    const token = makeJwt(NOW_S, { a: 'x' });
    expect(token.split('.')[1]).not.toContain('=');
    expect(getTokenExpiryMs(token)).toBe(NOW_MS);
  });
});
