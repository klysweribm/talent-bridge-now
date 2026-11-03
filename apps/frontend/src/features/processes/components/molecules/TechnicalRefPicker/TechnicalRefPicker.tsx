import { Button } from '@shared/components/atoms/Button';
import { ListErrorState } from '@shared/components/molecules/ListErrorState';
import { TECHNICAL_TEAM_COPY } from '../../../config/technicalTeam.copy';
import type { ITechnicalRefOption } from '../../../utils/technicalRefOptions';
import { CandidateCheckbox } from '../CandidateCheckbox';

const COPY = TECHNICAL_TEAM_COPY.picker;

export interface TechnicalRefPickerProps {
  readonly status:   'loading' | 'error' | 'empty' | 'ready';
  readonly options:  readonly ITechnicalRefOption[];
  readonly selected: readonly string[];
  readonly max:      number;
  readonly saving:   boolean;
  readonly onToggle: (id: string) => void;
  readonly onRetry:  () => void;
  readonly onSave:   () => void;
  readonly onCancel: () => void;
}

function Body({ status, options, selected, max, saving, onToggle, onRetry }: TechnicalRefPickerProps): JSX.Element {
  if (status === 'loading') return <div role="status" aria-label={COPY.loading} className="h-14 rounded bg-surface-high animate-pulse" />;
  if (status === 'error') return <ListErrorState message={COPY.loadError} retryLabel={COPY.retry} onRetry={onRetry} />;
  if (status === 'empty') return <p className="text-body-md text-text-secondary">{COPY.empty}</p>;
  const locked = selected.length >= max;
  return (
    <ul className="flex flex-col divide-y divide-outline-variant rounded-lg border border-outline-variant bg-surface-card">
      {options.map(option => {
        const checked = selected.includes(option.id);
        return (
          <li key={option.id}>
            <CandidateCheckbox label={COPY.option(option.fullName, option.band, option.inactive)} checked={checked}
              disabled={saving || (!checked && locked)} onToggle={() => onToggle(option.id)} />
          </li>
        );
      })}
    </ul>
  );
}

/** Selector con tope: al alcanzarlo se bloquean las casillas sin marcar y aparece el aviso. Solo props. */
export function TechnicalRefPicker(props: TechnicalRefPickerProps): JSX.Element {
  const { selected, max, saving, onSave, onCancel } = props;
  return (
    <div className="flex flex-col gap-sm" role="group" aria-label={COPY.heading}>
      <p className="text-body-md text-text-secondary">{COPY.counter(selected.length, max)}</p>
      {selected.length >= max && <p role="status" className="text-body-md text-status-warning">{COPY.limit(max)}</p>}
      <Body {...props} />
      <div className="flex gap-sm">
        <Button type="button" className="min-h-11" disabled={saving} onClick={onSave}>{saving ? COPY.saving : COPY.save}</Button>
        <Button type="button" variant="secondary" className="min-h-11" disabled={saving} onClick={onCancel}>{COPY.cancel}</Button>
      </div>
    </div>
  );
}
