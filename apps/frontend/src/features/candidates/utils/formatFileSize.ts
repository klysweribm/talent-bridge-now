import { BYTES_PER_KIB, BYTES_PER_MIB } from '../config/candidates.constants';

const ONE_DECIMAL = new Intl.NumberFormat('es', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const WHOLE_OR_ONE_DECIMAL = new Intl.NumberFormat('es', { maximumFractionDigits: 1 });

/** Tamaño legible con una decimal: KB bajo 1 MB, MB desde 1 MB (p. ej. "7,2 MB"). */
export function formatFileSize(bytes: number): string {
  return bytes >= BYTES_PER_MIB
    ? `${ONE_DECIMAL.format(bytes / BYTES_PER_MIB)} MB`
    : `${ONE_DECIMAL.format(bytes / BYTES_PER_KIB)} KB`;
}

/** Límite en MB sin decimal sobrante (p. ej. "5 MB"). */
export function formatSizeLimit(bytes: number): string {
  return `${WHOLE_OR_ONE_DECIMAL.format(bytes / BYTES_PER_MIB)} MB`;
}
