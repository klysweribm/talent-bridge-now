import type { TProcessStatus } from '@ibm-talent-bridge/shared-types';
import { PROCESS_STATUS_CHIP, PROCESS_STATUS_ORDER } from '@/config/processStatus';

export interface StatusSelectProps {
  readonly id:       string;
  readonly label:    string;
  readonly value:    TProcessStatus;
  readonly disabled: boolean;
  readonly onChange: (status: TProcessStatus) => void;
}

export function StatusSelect({ id, label, value, disabled, onChange }: StatusSelectProps): JSX.Element {
  return (
    <div className="flex flex-col gap-2xs">
      <label htmlFor={id} className="text-body-md font-medium text-text-primary">{label}</label>
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={event => onChange(event.target.value as TProcessStatus)}
        className="w-full min-h-11 px-sm rounded text-body-md text-text-primary bg-surface-card border border-outline focus:outline-2 focus:outline-primary-interactive disabled:opacity-50"
      >
        {PROCESS_STATUS_ORDER.map(status => <option key={status} value={status}>{PROCESS_STATUS_CHIP[status].label}</option>)}
      </select>
    </div>
  );
}
