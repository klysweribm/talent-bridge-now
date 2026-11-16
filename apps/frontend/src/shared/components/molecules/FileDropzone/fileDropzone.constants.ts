/** Estilos de la zona de carga (extraídos de `FileDropzone.tsx` para respetar el límite de líneas). */
export type TZoneState = 'idle' | 'dragging' | 'error';

export const ZONE_BASE_CLASSES = [
  'flex min-h-11 flex-col items-center justify-center gap-xs border border-dashed px-base py-xl text-center cursor-pointer',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-carbon-blue-60',
  'aria-disabled:cursor-not-allowed aria-disabled:opacity-50',
].join(' ');

export const ZONE_STYLE: Readonly<Record<TZoneState, string>> = {
  idle: 'border-carbon-gray-50 bg-white hover:bg-carbon-gray-10 hover:border-carbon-blue-60',
  dragging: 'border-carbon-blue-60 bg-carbon-gray-10',
  error: 'border-carbon-red bg-carbon-red-10',
};
