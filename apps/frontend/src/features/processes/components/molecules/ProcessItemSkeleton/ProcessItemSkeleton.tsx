export interface ProcessItemSkeletonProps {
  readonly label: string;
  readonly rows:  number;
}

export function ProcessItemSkeleton({ label, rows }: ProcessItemSkeletonProps): JSX.Element {
  return (
    <ul role="status" aria-label={label} className="flex flex-col gap-xs">
      {Array.from({ length: rows }, (_, index) => (
        <li key={index} aria-hidden="true" className="p-base bg-surface rounded-lg">
          <div className="h-4 rounded bg-surface-high animate-pulse" />
        </li>
      ))}
    </ul>
  );
}
