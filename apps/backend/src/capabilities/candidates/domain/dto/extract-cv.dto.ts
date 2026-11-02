import type { TCvExtractor } from '@ibm-talent-bridge/shared-types';
import { IsIn } from 'class-validator';
import { CV_EXTRACTION_MODES } from '../constants/cv.constants';

/** Campos de texto del multipart `POST /candidates/cv-extraction` (el archivo va aparte, en `file`). */
export class ExtractCvDto {
  @IsIn(CV_EXTRACTION_MODES)
  mode!: TCvExtractor;
}
