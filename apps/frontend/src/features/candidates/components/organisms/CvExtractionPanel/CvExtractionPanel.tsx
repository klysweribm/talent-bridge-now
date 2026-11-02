import type { ICvExtractionResult } from '@ibm-talent-bridge/shared-types';
import { Button } from '@shared/components/atoms/Button';
import { EXTRACTION_MAX_SECONDS } from '../../../config/candidates.constants';
import { useCvExtraction } from '../../../hooks/useCvExtraction';
import { CvExtractionError } from '../../molecules/CvExtractionError';
import { CvFileInput } from '../../molecules/CvFileInput';
import { ExtractorSelector } from '../../molecules/ExtractorSelector';

export interface CvExtractionPanelProps {
  readonly onExtracted: (result: ICvExtractionResult) => void;
  readonly onManual: () => void;
}

export function CvExtractionPanel({ onExtracted, onManual }: CvExtractionPanelProps): JSX.Element {
  const { mode, setMode, file, fileError, extract, unavailable, select, submit, retryClassic } = useCvExtraction(onExtracted);

  return (
    <section className="flex flex-col gap-base" aria-label="Extraer perfil desde un CV">
      <ExtractorSelector value={mode} onChange={setMode} disabled={extract.isPending} />
      <CvFileInput file={file} error={fileError} onSelect={select} disabled={extract.isPending} />
      <div aria-live="polite">
        {extract.isPending && (
          <p role="status" className="text-body-md text-text-secondary">
            Extrayendo el perfil… puede tardar hasta {EXTRACTION_MAX_SECONDS} segundos. No cierres esta página.
          </p>
        )}
        {extract.isError && (
          <CvExtractionError
            message={unavailable ? 'ICA no está disponible en este momento.' : extract.error.message}
            onRetryClassic={unavailable && file ? retryClassic : undefined}
          />
        )}
      </div>
      <div className="flex gap-sm">
        <Button onClick={submit} disabled={!file || Boolean(fileError)} loading={extract.isPending}>Extraer perfil</Button>
        <Button variant="ghost" onClick={onManual} disabled={extract.isPending}>Escritura manual</Button>
      </div>
    </section>
  );
}
