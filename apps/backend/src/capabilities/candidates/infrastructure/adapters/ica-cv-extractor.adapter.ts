import { Injectable, Logger } from '@nestjs/common';
import type { ICvExtractionResult, TCvExtractor } from '@ibm-talent-bridge/shared-types';
import { AiCoordinatorService } from '../../../ai/application/services/ai-coordinator.service';
import type { IAiOutputSchema } from '../../../ai/domain/interfaces/ai-topic.interface';
import type { ICvExtractorPort, TCvExtractionOutcome } from '../../application/ports/cv-extractor.port';
import { findMissingFields, sanitizeDraft } from '../../domain/cv-draft.sanitizer';
import type { ICvFile } from '../../domain/interfaces/cv-file.interface';
import { CV_EXTRACTION_SYSTEM_PROMPT, CV_EXTRACTION_USER_PROMPT } from './cv-extraction.prompt';

const SCHEMA: IAiOutputSchema = {
  validate: (value) => (typeof value === 'object' && value !== null && !Array.isArray(value) ? null : 'The output must be a JSON object'),
};
const TOPIC = { systemPrompt: CV_EXTRACTION_SYSTEM_PROMPT, jsonMode: true, outputSchema: SCHEMA } as const;

/**
 * Extractor vía ICA `files`. El CV es DATOS no confiables; la salida del modelo se parsea (con una
 * reparación), se valida contra el esquema y se descarta lo que no encaje. Nunca lanza ni loguea contenido.
 */
@Injectable()
export class IcaCvExtractor implements ICvExtractorPort {
  readonly mode: TCvExtractor = 'ica';
  private readonly logger = new Logger(IcaCvExtractor.name);

  constructor(private readonly ai: AiCoordinatorService) {}

  async extract(file: ICvFile): Promise<TCvExtractionOutcome> {
    const answer = await this.ai.askAboutFile({ file, definition: TOPIC, query: CV_EXTRACTION_USER_PROMPT });
    if (!answer.ok) return { ok: false, reason: answer.reason };
    const { draft, dropped } = sanitizeDraft(JSON.parse(answer.answer) as unknown);
    if (dropped > 0) this.logger.warn(`CV draft values dropped by the schema: count=${dropped}`);
    const result: ICvExtractionResult = {
      extractor: 'ica',
      draft,
      missingFields: findMissingFields(draft),
      warnings: dropped > 0 ? ['Algunos valores extraídos no encajaban en el esquema y se descartaron: revisa los datos.'] : [],
    };
    return { ok: true, result };
  }
}
