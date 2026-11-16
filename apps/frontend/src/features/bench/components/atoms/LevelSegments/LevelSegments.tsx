export interface LevelSegmentsProps {
  readonly filled: number;
  readonly total:  number;
}

/** Barra decorativa de segmentos 20x6 (el valor textual lo da quien la usa, por eso es aria-hidden). */
export function LevelSegments({ filled, total }: LevelSegmentsProps): JSX.Element {
  return (
    <span aria-hidden="true" data-testid="level-segments" className="flex gap-[2px]">
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          data-filled={index < filled}
          className={`h-[6px] w-5 ${index < filled ? 'bg-carbon-blue-60' : 'bg-carbon-gray-20'}`}
        />
      ))}
    </span>
  );
}
