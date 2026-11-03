import { useState } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import type { ICvExtractionResult, TCvExtractor } from '@ibm-talent-bridge/shared-types';
import { DEFAULT_EXTRACTOR } from '../config/candidates.constants';
import { CvExtractionUnavailableError } from '../infrastructure/candidates.errors';
import type { IExtractCvInput } from '../types/candidates.types';
import { validateCvFile } from '../utils/validateCvFile';
import { useExtractCv } from './useExtractCv';

export interface IUseCvExtraction {
  readonly mode: TCvExtractor;
  readonly setMode: (mode: TCvExtractor) => void;
  readonly file: File | undefined;
  readonly fileError: string | null;
  readonly extract: UseMutationResult<ICvExtractionResult, Error, IExtractCvInput>;
  readonly unavailable: boolean;
  readonly select: (file: File | undefined) => void;
  readonly submit: () => void;
  /** Acción explícita del usuario: reenvía el MISMO archivo con el extractor clásico. */
  readonly retryClassic: () => void;
}

/** Estado de la pantalla de subida (modo, archivo, validación) + la mutación de extracción. */
export function useCvExtraction(onExtracted: (result: ICvExtractionResult, file: File) => void): IUseCvExtraction {
  const [mode, setMode] = useState<TCvExtractor>(DEFAULT_EXTRACTOR);
  const [file, setFile] = useState<File | undefined>();
  const [fileError, setFileError] = useState<string | null>(null);
  const extract = useExtractCv();

  const run = (target: File, chosen: TCvExtractor): void =>
    extract.mutate({ file: target, mode: chosen }, { onSuccess: result => onExtracted(result, target) });

  return {
    mode, setMode, file, fileError, extract,
    unavailable: extract.error instanceof CvExtractionUnavailableError,
    select: next => {
      setFile(next);
      setFileError(next ? validateCvFile(next) : null);
      extract.reset();
    },
    submit: () => { if (file && !fileError) run(file, mode); },
    retryClassic: () => { if (file) { setMode('classic'); run(file, 'classic'); } },
  };
}
