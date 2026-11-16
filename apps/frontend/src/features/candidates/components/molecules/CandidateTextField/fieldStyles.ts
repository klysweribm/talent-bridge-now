/** Campo relleno del prototipo (Future Now): fondo gray-10, solo borde inferior; inválido con anillo rojo inset. */
const FILLED_BASE = 'w-full rounded-none border-0 border-b border-carbon-gray-50 bg-carbon-gray-10 px-base text-body text-carbon-gray-100 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-carbon-blue-60';
const INVALID_RING = 'ring-2 ring-inset ring-carbon-red';

export const FIELD_LABEL = 'text-label text-carbon-gray-70';
/** Aviso «no detectado»: franja izquierda amarilla además del texto, nunca solo color. */
export const FIELD_MISSING = 'border-l-4 border-carbon-yellow pl-sm bg-carbon-yellow-tag-bg';

export const inputClasses = (invalid: boolean): string => `${FILLED_BASE} h-10 ${invalid ? INVALID_RING : ''}`;
export const textareaClasses = (invalid: boolean): string => `${FILLED_BASE} py-sm ${invalid ? INVALID_RING : ''}`;
