import { CONTROL_CLASSES, COUNTRY_OPTIONS } from '../../../config/bench.constants';

export interface CountryFieldProps {
  readonly value:    string | undefined;
  readonly onChange: (country: string | undefined) => void;
}

export function CountryField({ value, onChange }: CountryFieldProps): JSX.Element {
  return (
    <div className="flex flex-col gap-xs">
      <label htmlFor="bench-country" className="text-label-md text-text-secondary">País</label>
      <select
        id="bench-country"
        value={value ?? ''}
        className={CONTROL_CLASSES}
        onChange={event => onChange(event.target.value || undefined)}
      >
        <option value="">Todos</option>
        {COUNTRY_OPTIONS.map(country => <option key={country} value={country}>{country}</option>)}
      </select>
    </div>
  );
}
