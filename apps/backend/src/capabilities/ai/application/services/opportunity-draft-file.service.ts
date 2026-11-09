import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import type { IOpportunityDraftResponse } from '@ibm-talent-bridge/shared-types';
import { DOCUMENT_TEXT_EXTRACTOR_PORT, type IDocumentTextExtractorPort } from '../../../../shared/document-text/document-text-extractor.port';
import { OpportunityDraftError } from '../../domain/errors/opportunity-draft.error';
import type { IOpportunitySource, IOpportunityUploadedFile, TOpportunitySourceConfig } from '../../domain/interfaces/opportunity-source.interface';
import { OPPORTUNITY_DRAFT_MESSAGES, OPPORTUNITY_SOURCE_CONFIG } from '../../domain/opportunity-draft/opportunity-draft.constants';
import { validateOpportunitySource } from '../../domain/opportunity-draft/opportunity-source.validator';
import { OpportunityDraftService } from './opportunity-draft.service';

/** Nombre y MIME que fija el servidor para el extractor: el nombre original del cliente nunca se usa. */
const EXTRACTOR_FILE = {
  pdf: { filename: 'brochure.pdf', mimeType: 'application/pdf' },
  docx: { filename: 'brochure.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
} as const;

const unreadable = (): OpportunityDraftError => new OpportunityDraftError('OPPORTUNITY_SOURCE_UNREADABLE', OPPORTUNITY_DRAFT_MESSAGES.sourceUnreadable);

/**
 * Brochure (PDF/DOCX/MD/TXT) -> mismo borrador que el texto libre (R1: no crea ni guarda nada). Se procesa en memoria
 * y se descarta (R3). Sin `@TraceFlow()`. Logs: solo bytes, latencia y resultado; jamás el nombre ni el contenido.
 */
@Injectable()
export class OpportunityDraftFileService {
  private readonly logger = new Logger(OpportunityDraftFileService.name);

  constructor(
    @Inject(DOCUMENT_TEXT_EXTRACTOR_PORT) private readonly extractor: IDocumentTextExtractorPort,
    private readonly drafts: OpportunityDraftService,
    @Inject(OPPORTUNITY_SOURCE_CONFIG) private readonly config: TOpportunitySourceConfig,
  ) {}

  async draft(upload: IOpportunityUploadedFile | undefined): Promise<IOpportunityDraftResponse> {
    const startedAt = Date.now();
    const bytes = upload?.buffer.length ?? 0;
    try {
      const source = this.validate(upload);
      const response = await this.drafts.draft(await this.readText(source));
      this.report(bytes, startedAt, 'ok');
      return response;
    } catch (error) {
      this.report(bytes, startedAt, error instanceof OpportunityDraftError ? error.code : error instanceof BadRequestException ? 'INVALID_FILE' : 'ERROR');
      throw error;
    }
  }

  private validate(upload: IOpportunityUploadedFile | undefined): IOpportunitySource {
    const result = validateOpportunitySource(upload, this.config.maxFileBytes);
    if (!result.ok) throw new BadRequestException(result.message);
    return result.source;
  }

  private async readText(source: IOpportunitySource): Promise<string> {
    const text = source.kind === 'text' ? source.data.toString('utf8') : await this.extract(source as IOpportunitySource<'pdf' | 'docx'>);
    if (text.trim().length === 0) throw unreadable();
    return text;
  }

  private async extract(source: IOpportunitySource<'pdf' | 'docx'>): Promise<string> {
    try {
      return await this.extractor.extractText({ ...EXTRACTOR_FILE[source.kind], data: source.data });
    } catch (error) {
      if (error instanceof BadRequestException) throw unreadable();
      throw error;
    }
  }

  private report(bytes: number, startedAt: number, outcome: string): void {
    this.logger.log(`Opportunity draft from file: bytes=${bytes} latencyMs=${Date.now() - startedAt} outcome=${outcome}`);
  }
}
