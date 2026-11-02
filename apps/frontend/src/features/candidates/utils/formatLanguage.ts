const NAMES = new Intl.DisplayNames('es', { type: 'language', fallback: 'code' });

/** Nombre en español de un idioma ISO 639-1 ("en" → "inglés"); ante un código inválido devuelve el código. */
export function formatLanguage(code: string): string {
  try {
    const name = NAMES.of(code);
    return name ? name.charAt(0).toUpperCase() + name.slice(1) : code;
  } catch {
    return code;
  }
}
