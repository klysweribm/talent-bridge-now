export interface TableSkeletonProps {
  /** Etiqueta accesible anunciada como estado de carga. */
  readonly label:       string;
  readonly columnCount: number;
  readonly rows:        number;
}

export function TableSkeleton({ label, columnCount, rows }: TableSkeletonProps): JSX.Element {
  return (
    <tbody role="status" aria-label={label}>
      {Array.from({ length: rows }, (_, index) => (
        <tr key={index} className="h-14 border-b border-outline-variant">
          <td colSpan={columnCount} className="px-base">
            <div className="h-4 rounded bg-surface-high animate-pulse" />
          </td>
        </tr>
      ))}
    </tbody>
  );
}
