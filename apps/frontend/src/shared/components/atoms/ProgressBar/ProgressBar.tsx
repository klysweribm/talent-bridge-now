export interface ProgressBarProps {
  /** Nombre accesible de la barra. */
  readonly label: string;
  /** 0-100. Sin valor la barra es indeterminada (sin `aria-valuenow`): no se inventa un porcentaje. */
  readonly value?: number;
}

export function ProgressBar({ label, value }: ProgressBarProps): JSX.Element {
  const determinate = value !== undefined;
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={determinate ? 0 : undefined}
      aria-valuemax={determinate ? 100 : undefined}
      aria-valuenow={determinate ? value : undefined}
      className="relative h-xs w-full overflow-hidden rounded-full bg-surface-high"
    >
      <div
        className={`h-full rounded-full bg-primary-interactive ${
          determinate ? '' : 'w-2/5 animate-progress-indeterminate motion-reduce:animate-none'}`}
        style={determinate ? { width: `${value}%` } : undefined}
      />
    </div>
  );
}
