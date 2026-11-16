import { Icon } from '@shared/components/atoms/Icon';
import { CONTROL_CLASSES, FIELD_LABEL_CLASSES, COUNTRY_OPTIONS } from '../../../config/bench.constants';

export interface CountryFieldProps {
  readonly value:    string | undefined;
  readonly onChange: (country: string | undefined) => void;
}

export function CountryField({ value, onChange }: CountryFieldProps): JSX.Element {
  return (
    <div className="flex flex-col gap-xs">
      <label htmlFor="bench-country" className={FIELD_LABEL_CLASSES}>País</label>
      <div className="relative">
      <select
        id="bench-country"
        value={value ?? ''}
        className={CONTROL_CLASSES}
        onChange={event => onChange(event.target.value || undefined)}
      >
        <option value="">Todos</option>
        {COUNTRY_OPTIONS.map(country => <option key={country} value={country}>{country}</option>)}
      </select>
      <Icon name="chevron-down" size={16} className="pointer-events-none absolute right-base top-3 text-carbon-gray-100" />
      </div>
    </div>
  );
}
