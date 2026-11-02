import type { ConfigService } from '@nestjs/config';
import { CV_DEFAULT_MAX_FILE_BYTES } from '../../domain/constants/cv.constants';
import type { ICvUploadConfig } from '../../domain/interfaces/cv-upload-config.interface';

/** `CV_MAX_FILE_BYTES` (bytes). Valor ausente o inválido -> 5 MiB, nunca ilimitado. */
export function buildCvUploadConfig(config: Pick<ConfigService, 'get'>): ICvUploadConfig {
  const value = Number(config.get<string>('CV_MAX_FILE_BYTES'));
  return { maxFileBytes: Number.isInteger(value) && value > 0 ? value : CV_DEFAULT_MAX_FILE_BYTES };
}
