import { useState } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import type { IOpportunityDraftResponse } from '@ibm-talent-bridge/shared-types';
import { validateBrochureFile } from '../utils/validateBrochureFile';

export interface IDraftFileUpload {
  readonly uploadFile:      (file: File | undefined) => void;
  readonly localFileError?: string;
  readonly clearFileError:  () => void;
}

/** Valida el brochure en el cliente (sin llamar al servidor) y lo envía; el archivo solo vive durante la llamada. */
export function useDraftFileUpload(
  mutation: UseMutationResult<IOpportunityDraftResponse, Error, File>,
  onSuccess: (response: IOpportunityDraftResponse) => void,
  beforeUpload: () => void,
): IDraftFileUpload {
  const [localFileError, setLocalFileError] = useState<string>();
  const uploadFile = (file: File | undefined): void => {
    if (!file) return;
    beforeUpload();
    mutation.reset();
    const invalid = validateBrochureFile(file);
    setLocalFileError(invalid ?? undefined);
    if (!invalid) mutation.mutate(file, { onSuccess });
  };
  return { uploadFile, clearFileError: () => setLocalFileError(undefined), ...(localFileError && { localFileError }) };
}
