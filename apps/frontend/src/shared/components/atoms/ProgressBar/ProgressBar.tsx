export interface ProgressBarProps {
  /** Nombre accesible de la barra. */
  readonly label: string;
  /** 0-100. Sin valor la barra es indeterminada (sin `aria-valuenow`): no se inventa un porcentaje. */
  readonly value?: number;
  /** Altura de la pista: 8px (por defecto) o 4px. */
  readonly thin?: boolean;
}

export function ProgressBar({ label, value, thin = false }: ProgressBarProps): JSX.Element {
  const determinate = value !== undefined;
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={determinate ? 0 : undefined}
      aria-valuemax={determinate ? 100 : undefined}
      aria-valuenow={determinate ? value : undefined}
      className={`relative ${thin ? 'h-[4px]' : 'h-sm'} w-full overflow-hidden bg-carbon-gray-20`}
    >
      <div
        className={`h-full bg-carbon-blue-60 transition-[width] duration-[60ms] ease-linear ${
          determinate ? '' : 'w-2/5 animate-progress-indeterminate motion-reduce:animate-none'}`}
        style={determinate ? { width: `${value}%` } : undefined}
      />
    </div>
  );
}
