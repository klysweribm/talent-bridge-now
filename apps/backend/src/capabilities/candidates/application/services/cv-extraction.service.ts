import { BadRequestException, HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import type { ICvExtractionResult, ICvExtractionUnavailable, TCvExtractor } from '@ibm-talent-bridge/shared-types';
import { CV_EXTRACTORS, CV_UPLOAD_CONFIG } from '../../domain/constants/cv.constants';
import { validateCvUpload } from '../../domain/cv-file.validator';
import type { ICvUploadConfig } from '../../domain/interfaces/cv-upload-config.interface';
import type { ICvUploadedFile } from '../../domain/interfaces/cv-upload.interface';
import type { ICvExtractorPort } from '../ports/cv-extractor.port';
import { CandidateMatchService } from './candidate-match.service';

/**
 * Valida el archivo, elige el extractor por `mode` y traduce el fallo del proveedor a 503 `{ reason }`
 * (nunca 401). No persiste nada y no loguea el contenido ni el nombre del archivo.
 */
@Injectable()
export class CvExtractionService {
  private readonly logger = new Logger(CvExtractionService.name);

  constructor(
    @Inject(CV_EXTRACTORS) private readonly extractors: readonly ICvExtractorPort[],
    @Inject(CV_UPLOAD_CONFIG) private readonly config: ICvUploadConfig,
    private readonly matcher: CandidateMatchService,
  ) {}

  async extract(upload: ICvUploadedFile | undefined, mode: TCvExtractor): Promise<ICvExtractionResult> {
    const extractor = this.extractors.find((candidate) => candidate.mode === mode);
    if (!extractor) throw new BadRequestException('mode not supported yet');
    const validation = validateCvUpload(upload, this.config.maxFileBytes);
    if (!validation.ok) throw new BadRequestException(validation.message);

    const outcome = await extractor.extract(validation.file);
    if (!outcome.ok) {
      this.logger.warn(`CV extraction unavailable: mode=${mode} reason=${outcome.reason}`);
      const body: ICvExtractionUnavailable = { reason: outcome.reason };
      throw new HttpException(body, HttpStatus.SERVICE_UNAVAILABLE);
    }
    this.logger.log(
      `CV extracted: extractor=${outcome.result.extractor} bytes=${validation.file.data.length} missing=${outcome.result.missingFields.length}`,
    );
    return this.withMatches(outcome.result);
  }

  /** Adjunta `matches` solo si hay coincidencias. Un fallo de la búsqueda nunca rompe la extracción: se loguea solo el nombre del error. */
  private async withMatches(result: ICvExtractionResult): Promise<ICvExtractionResult> {
    try {
      const matches = await this.matcher.find(result.draft);
      return matches.exact || matches.similar.length > 0 ? { ...result, matches } : result;
    } catch (error) {
      this.logger.warn(`Candidate match lookup failed: error=${error instanceof Error ? error.name : 'unknown'}`);
      return result;
    }
  }
}
