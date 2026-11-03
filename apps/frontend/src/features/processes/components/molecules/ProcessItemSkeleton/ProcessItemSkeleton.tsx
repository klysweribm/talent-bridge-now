export interface ProcessItemSkeletonProps {
  readonly label: string;
  readonly rows:  number;
}

const BLOCK = 'rounded bg-surface-high animate-pulse';

export function ProcessItemSkeleton({ label, rows }: ProcessItemSkeletonProps): JSX.Element {
  return (
    <ul role="status" aria-label={label} className="flex flex-col">
      {Array.from({ length: rows }, (_, index) => (
        <li key={index} aria-hidden="true" className="py-base flex flex-col sm:flex-row sm:items-center justify-between gap-md border-b border-surface-high last:border-b-0">
          <div className="flex flex-col gap-sm">
            <div className="flex items-center gap-sm">
              <div className={`h-5 w-48 ${BLOCK}`} />
              <div className={`h-6 w-20 ${BLOCK}`} />
            </div>
            <div className={`h-4 w-56 ${BLOCK}`} />
            <div className="flex items-center gap-sm">
              <div className="h-6 w-6 rounded-full bg-surface-high animate-pulse" />
              <div className="h-6 w-6 rounded-full bg-surface-high animate-pulse" />
              <div className={`h-4 w-32 ${BLOCK}`} />
            </div>
          </div>
          <div className={`h-11 w-32 ${BLOCK}`} />
        </li>
      ))}
    </ul>
  );
}
