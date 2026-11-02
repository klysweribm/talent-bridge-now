import type { TCvExtractor } from '@ibm-talent-bridge/shared-types';
import { EXTRACTOR_HINTS, EXTRACTOR_LABELS, EXTRACTOR_MODES } from '../../../config/candidates.constants';

export interface ExtractorSelectorProps {
  readonly value: TCvExtractor;
  readonly onChange: (mode: TCvExtractor) => void;
  readonly disabled?: boolean;
}

export function ExtractorSelector({ value, onChange, disabled = false }: ExtractorSelectorProps): JSX.Element {
  return (
    <fieldset className="flex flex-col gap-sm" disabled={disabled}>
      <legend className="text-body-md-medium text-text-primary mb-xs">Método de extracción</legend>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
        {EXTRACTOR_MODES.map(mode => (
          <label
            key={mode}
            className={`flex items-start gap-sm p-md rounded border cursor-pointer ${
              value === mode ? 'border-primary-interactive bg-status-info-bg' : 'border-outline-variant bg-surface-card'}`}
          >
            <input type="radio" name="cv-mode" checked={value === mode} onChange={() => onChange(mode)} className="mt-2xs" />
            <span className="flex flex-col">
              <span className="text-body-md-medium text-text-primary">{EXTRACTOR_LABELS[mode]}</span>
              <span className="text-label-md text-text-secondary">{EXTRACTOR_HINTS[mode]}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
