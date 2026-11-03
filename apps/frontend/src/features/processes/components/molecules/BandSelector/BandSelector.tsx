import { OPPORTUNITY_BANDS } from '../../../config/processOpportunity.constants';
import { OPPORTUNITY_COPY } from '../../../config/processOpportunity.copy';

export interface BandSelectorProps {
  readonly id:       string;
  readonly label:    string;
  readonly value?:   number;
  readonly error?:   string;
  readonly onChange: (band: number) => void;
}

/** Grupo de radios segmentado: flechas mueven la selección (nativo), Tab entra al grupo y cada opción mide min 44px. */
export function BandSelector({ id, label, value, error, onChange }: BandSelectorProps): JSX.Element {
  return (
    <fieldset id={id} aria-describedby={error ? `${id}-error` : undefined} aria-invalid={Boolean(error) || undefined} className="flex flex-col gap-2xs">
      <legend className="text-body-md font-medium text-text-primary mb-2xs">{label}</legend>
      <div className="flex flex-wrap gap-sm">
        {OPPORTUNITY_BANDS.map(band => (
          <label
            key={band}
            className={`inline-flex items-center justify-center min-h-11 min-w-11 px-md rounded border text-body-md-medium cursor-pointer has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary-interactive ${
              value === band ? 'bg-primary-interactive text-primary-on border-primary-interactive' : 'bg-surface-card text-text-primary border-outline hover:bg-surface-low'}`}
          >
            <input
              type="radio" name={`${id}-band`} value={band} checked={value === band} onChange={() => onChange(band)}
              aria-label={OPPORTUNITY_COPY.bandOption(band)} className="sr-only"
            />
            <span aria-hidden="true">{band}</span>
          </label>
        ))}
      </div>
      {error && <span id={`${id}-error`} role="alert" className="text-label-md text-status-danger">{error}</span>}
    </fieldset>
  );
}
