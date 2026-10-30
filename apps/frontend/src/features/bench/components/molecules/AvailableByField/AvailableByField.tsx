import { CONTROL_CLASSES } from '../../../config/bench.constants';

export interface AvailableByFieldProps {
  readonly value:    string | undefined;
  readonly onChange: (date: string | undefined) => void;
}

export function AvailableByField({ value, onChange }: AvailableByFieldProps): JSX.Element {
  return (
    <div className="flex flex-col gap-xs">
      <label htmlFor="bench-available-by" className="text-label-md text-text-secondary">Disponible antes de</label>
      <input
        id="bench-available-by"
        type="date"
        value={value ?? ''}
        className={CONTROL_CLASSES}
        onChange={event => onChange(event.target.value || undefined)}
      />
    </div>
  );
}
