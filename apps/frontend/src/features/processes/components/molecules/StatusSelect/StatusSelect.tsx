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
    <div className="flex flex-col gap-sm">
      <label htmlFor={id} className="text-label text-carbon-gray-70">{label}</label>
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={event => onChange(event.target.value as TProcessStatus)}
        className="w-full h-10 px-base rounded-none text-body text-carbon-gray-100 bg-carbon-gray-10 border-0 border-b border-carbon-gray-50 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-carbon-blue-60 disabled:opacity-50"
      >
        {PROCESS_STATUS_ORDER.map(status => <option key={status} value={status}>{PROCESS_STATUS_CHIP[status].label}</option>)}
      </select>
    </div>
  );
}
