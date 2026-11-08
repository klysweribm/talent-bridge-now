import { Inject, Injectable, Logger } from '@nestjs/common';
import type { IOpportunityDraftResponse, TAiUnavailableReason, TOpportunityDraftErrorCode } from '@ibm-talent-bridge/shared-types';
import { OpportunityDraftError } from '../../domain/errors/opportunity-draft.error';
import type { TOpportunityDraftConfig } from '../../domain/interfaces/opportunity-draft-config.interface';
import { OPPORTUNITY_DRAFT_CONFIG, OPPORTUNITY_DRAFT_MESSAGES } from '../../domain/opportunity-draft/opportunity-draft.constants';
import { sanitizeOpportunityDraft } from '../../domain/opportunity-draft/opportunity-draft.sanitizer';
import { buildOpportunityDraftUserPrompt, OPPORTUNITY_DRAFT_DEFINITION } from '../prompts/opportunity-draft.prompt';
import { AiCoordinatorService } from './ai-coordinator.service';

const errorFor = (reason: TAiUnavailableReason): OpportunityDraftError =>
  reason === 'TIMEOUT'
    ? new OpportunityDraftError('AI_TIMEOUT', OPPORTUNITY_DRAFT_MESSAGES.timeout)
    : new OpportunityDraftError('AI_UNAVAILABLE', OPPORTUNITY_DRAFT_MESSAGES.unavailable);

/**
 * Convierte un texto libre en el borrador del formulario de la oportunidad (R1: no crea ni guarda nada).
 * Lanza `OpportunityDraftError` con un código estable. Los logs llevan solo longitud, latencia y resultado (R3):
 * ni el texto del usuario ni el borrador aparecen jamás en un mensaje.
 */
@Injectable()
export class OpportunityDraftService {
  private readonly logger = new Logger(OpportunityDraftService.name);

  constructor(
    private readonly ai: AiCoordinatorService,
    @Inject(OPPORTUNITY_DRAFT_CONFIG) private readonly config: TOpportunityDraftConfig,
  ) {}

  async draft(text: string): Promise<IOpportunityDraftResponse> {
    const startedAt = Date.now();
    const chars = text.length;
    try {
      const response = await this.generate(text);
      this.report(chars, startedAt, 'ok');
      return response;
    } catch (error) {
      const code: TOpportunityDraftErrorCode = error instanceof OpportunityDraftError ? error.code : 'AI_UNAVAILABLE';
      this.report(chars, startedAt, code);
      throw error;
    }
  }

  private async generate(text: string): Promise<IOpportunityDraftResponse> {
    const config = this.config;
    if (!config.enabled) throw new OpportunityDraftError('AI_UNAVAILABLE', OPPORTUNITY_DRAFT_MESSAGES.unavailable);
    if (text.length > config.maxTextChars) {
      throw new OpportunityDraftError('OPPORTUNITY_TEXT_TOO_LONG', OPPORTUNITY_DRAFT_MESSAGES.tooLong(config.maxTextChars));
    }
    const answer = await this.ai.askWithDefinition({
      definition: OPPORTUNITY_DRAFT_DEFINITION,
      query: buildOpportunityDraftUserPrompt(text),
      timeoutMs: config.timeoutMs,
    });
    if (!answer.ok) throw errorFor(answer.reason);
    return sanitizeOpportunityDraft(JSON.parse(answer.answer) as unknown);
  }

  private report(chars: number, startedAt: number, outcome: string): void {
    this.logger.log(`Opportunity draft: chars=${chars} latencyMs=${Date.now() - startedAt} outcome=${outcome}`);
  }
}
