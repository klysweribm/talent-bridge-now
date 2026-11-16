import type { TCvExtractor } from '@ibm-talent-bridge/shared-types';
import { Icon } from '@shared/components/atoms/Icon';
import { DEFAULT_EXTRACTOR, EXTRACTOR_HINTS, EXTRACTOR_LABELS, EXTRACTOR_MODES } from '../../../config/candidates.constants';
import { EXTRACTOR_RECOMMENDED_TAG } from '../../../config/candidates.copy';

export interface ExtractorSelectorProps {
  readonly value: TCvExtractor;
  readonly onChange: (mode: TCvExtractor) => void;
  readonly disabled?: boolean;
  /** Fuerza una columna aunque el viewport sea ancho (p. ej. dentro de un panel lateral). */
  readonly stacked?: boolean;
}

const GRID_AUTO_FIT = 'grid-cols-[repeat(auto-fit,minmax(200px,1fr))]';

/** Círculo del prototipo: relleno negro con check si está elegido; contorno gris si no. */
function Marker({ selected }: { readonly selected: boolean }): JSX.Element {
  return selected
    ? <span aria-hidden="true" className="flex size-5 shrink-0 items-center justify-center rounded-full bg-carbon-gray-100 text-white"><Icon name="check" size={14} /></span>
    : <span aria-hidden="true" className="size-5 shrink-0 rounded-full border border-carbon-gray-50" />;
}

export function ExtractorSelector({ value, onChange, disabled = false, stacked = false }: ExtractorSelectorProps): JSX.Element {
  return (
    <fieldset className="flex flex-col gap-sm" disabled={disabled}>
      <legend className="text-label text-carbon-gray-70 mb-sm">Método de extracción</legend>
      <div className={`grid ${stacked ? 'grid-cols-1' : GRID_AUTO_FIT} gap-sm`}>
        {EXTRACTOR_MODES.map(mode => {
          const selected = value === mode;
          return (
            <label
              key={mode}
              className={`relative flex min-h-[112px] cursor-pointer items-start justify-between gap-sm bg-carbon-gray-10 p-base has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-carbon-blue-60 ${
                selected ? 'shadow-[inset_0_0_0_2px] shadow-carbon-gray-100' : 'shadow-[inset_0_0_0_1px] shadow-carbon-gray-20'} ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
            >
              <input type="radio" name="cv-mode" checked={selected} onChange={() => onChange(mode)} className="sr-only" />
              <span className="flex flex-col gap-xs">
                <span className="font-semibold text-body text-carbon-gray-100">{EXTRACTOR_LABELS[mode]}</span>
                <span className="text-label text-carbon-gray-70">{EXTRACTOR_HINTS[mode]}</span>
                {mode === DEFAULT_EXTRACTOR && (
                  <span className="inline-flex h-5 w-fit items-center rounded-[10px] bg-carbon-blue-20 px-sm text-label text-carbon-blue-80">{EXTRACTOR_RECOMMENDED_TAG}</span>
                )}
              </span>
              <Marker selected={selected} />
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
