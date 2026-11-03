import type { ICvExtractionResult } from '@ibm-talent-bridge/shared-types';
import { Button } from '@shared/components/atoms/Button';
import { useCvExtraction } from '../../../hooks/useCvExtraction';
import { CvAnalysisCard } from '../../molecules/CvAnalysisCard/CvAnalysisCard';
import { CvDropzone } from '../../molecules/CvDropzone/CvDropzone';
import { CvExtractionError } from '../../molecules/CvExtractionError';
import { CvResultCard } from '../../molecules/CvResultCard/CvResultCard';
import { ExtractorSelector } from '../../molecules/ExtractorSelector';
import { NewCandidateHeader } from '../../molecules/NewCandidateHeader/NewCandidateHeader';

export interface CvExtractionPanelProps {
  readonly onExtracted: (result: ICvExtractionResult, file: File) => void;
  readonly onManual: () => void;
}

export function CvExtractionPanel({ onExtracted, onManual }: CvExtractionPanelProps): JSX.Element {
  const { mode, setMode, file, fileError, extract, unavailable, select, submit, retryClassic } = useCvExtraction(onExtracted);
  const pending = extract.isPending;

  return (
    <section className="flex flex-col gap-base" aria-label="Extraer perfil desde un CV">
      <NewCandidateHeader />
      <ExtractorSelector value={mode} onChange={setMode} disabled={pending} />
      {file && !fileError
        ? <CvResultCard file={file} onRemove={pending ? undefined : () => select(undefined)} />
        : <CvDropzone error={fileError} onSelect={select} />}
      {pending && <CvAnalysisCard />}
      <div aria-live="polite">
        {extract.isError && (
          <CvExtractionError
            message={unavailable ? 'ICA no está disponible en este momento.' : extract.error.message}
            onRetryClassic={unavailable && file ? retryClassic : undefined}
          />
        )}
      </div>
      <div className="flex gap-sm">
        <Button onClick={submit} disabled={!file || Boolean(fileError)} loading={pending}>Extraer perfil</Button>
        <Button variant="ghost" onClick={onManual} disabled={pending}>Escritura manual</Button>
      </div>
    </section>
  );
}
