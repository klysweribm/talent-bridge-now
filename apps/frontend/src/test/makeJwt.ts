const toBase64Url = (value: string): string =>
  btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

/** JWT SIN firma para tests: header.payload.signature en base64url, `exp` en segundos. */
export function makeJwt(expSeconds: number, extraClaims: Readonly<Record<string, unknown>> = {}): string {
  const header  = toBase64Url(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const payload = toBase64Url(JSON.stringify({ ...extraClaims, exp: expSeconds }));
  return `${header}.${payload}.signature`;
}

/** Atajo: JWT que vence `offsetSeconds` desde ahora (negativo = ya vencido). */
export function makeJwtExpiringIn(offsetSeconds: number): string {
  return makeJwt(Math.floor(Date.now() / 1000) + offsetSeconds);
}
