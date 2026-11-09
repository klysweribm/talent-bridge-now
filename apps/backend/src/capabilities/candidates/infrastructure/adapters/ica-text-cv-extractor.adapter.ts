import { Inject, Injectable } from '@nestjs/common';
import type { TCvExtractor } from '@ibm-talent-bridge/shared-types';
import type { ICvExtractorPort, TCvExtractionOutcome } from '../../application/ports/cv-extractor.port';
import { DOCUMENT_TEXT_EXTRACTOR_PORT, type IDocumentTextExtractorPort } from '../../../../shared/document-text/document-text-extractor.port';
import { findMissingFields } from '../../domain/cv-draft.sanitizer';
import type { ICvFile } from '../../domain/interfaces/cv-file.interface';
import { CvIcaDraftService } from './cv-ica-draft.service';

/**
 * Extractor ICA con el texto del CV en línea: texto local (pdf-parse/mammoth) + un mensaje de chat, sin `files`.
 * Sin `@TraceFlow()` ni logs de contenido.
 */
@Injectable()
export class IcaTextCvExtractor implements ICvExtractorPort {
  readonly mode: TCvExtractor = 'ica-text';

  constructor(
    @Inject(DOCUMENT_TEXT_EXTRACTOR_PORT) private readonly text: IDocumentTextExtractorPort,
    private readonly icaDraft: CvIcaDraftService,
  ) {}

  async extract(file: ICvFile): Promise<TCvExtractionOutcome> {
    const outcome = await this.icaDraft.draftFromText(await this.text.extractText(file));
    if (!outcome.ok) return { ok: false, reason: outcome.reason };
    return {
      ok: true,
      result: { extractor: 'ica-text', draft: outcome.draft, missingFields: findMissingFields(outcome.draft), warnings: outcome.warnings },
    };
  }
}
