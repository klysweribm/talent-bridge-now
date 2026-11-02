import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import type { ICvExtractionResult } from '@ibm-talent-bridge/shared-types';
import { extractCv } from '../infrastructure/candidates.infra';
import type { IExtractCvInput } from '../types/candidates.types';

/** Extrae un borrador desde un CV. No persiste nada: el resultado solo alimenta el formulario. */
export function useExtractCv(): UseMutationResult<ICvExtractionResult, Error, IExtractCvInput> {
  return useMutation<ICvExtractionResult, Error, IExtractCvInput>({ mutationFn: input => extractCv(input) });
}
