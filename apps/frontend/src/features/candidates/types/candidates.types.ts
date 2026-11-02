import type { TCvExtractor } from '@ibm-talent-bridge/shared-types';

export interface IExtractCvInput {
  readonly file: File;
  readonly mode: TCvExtractor;
}
