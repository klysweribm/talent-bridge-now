/**
 * inputField.utils — helpers puros usados por `InputField` (DT-004).
 * Estilo filled de Carbon: sin borde salvo el inferior; foco 2px azul inset; inválido con anillo rojo.
 */
export function buildInputClassName(hasError: boolean, hasIcon: boolean): string {
  return [
    'w-full h-10 px-base rounded-none text-body text-carbon-gray-100',
    'bg-carbon-gray-10 border-0 border-b border-carbon-gray-50',
    'placeholder:text-text-placeholder',
    'focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-carbon-blue-60',
    'read-only:bg-transparent read-only:border-carbon-gray-30',
    hasError ? 'ring-2 ring-inset ring-carbon-red' : '',
    hasIcon ? 'pl-8' : '',
  ].join(' ');
}

export function buildInputId(id: string | undefined, label: string): string {
  return id ?? `input-${label.replace(/\s+/g, '-').toLowerCase()}`;
}
