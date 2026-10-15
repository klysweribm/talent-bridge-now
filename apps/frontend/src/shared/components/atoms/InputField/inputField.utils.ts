/**
 * inputField.utils — helpers puros usados por `InputField` (DT-004).
 */
export function buildInputClassName(hasError: boolean, hasIcon: boolean): string {
  return [
    'w-full h-10 px-sm rounded text-body-md text-text-primary',
    'bg-surface-card border border-outline',
    'placeholder:text-[#a8a8a8]',
    'focus:outline-2 focus:outline-primary-interactive focus:border-transparent',
    hasError ? 'border-2 border-status-danger' : 'border-[#8d8d8d]',
    hasIcon ? 'pl-8' : '',
  ].join(' ');
}

export function buildInputId(id: string | undefined, label: string): string {
  return id ?? `input-${label.replace(/\s+/g, '-').toLowerCase()}`;
}
