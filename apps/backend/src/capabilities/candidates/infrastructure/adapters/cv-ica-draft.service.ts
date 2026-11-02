import { Injectable, Logger } from '@nestjs/common';
import type { ICandidateProfileDraft, TAiUnavailableReason } from '@ibm-talent-bridge/shared-types';
import { AiCoordinatorService } from '../../../ai/application/services/ai-coordinator.service';
import type { IAiOutputSchema } from '../../../ai/domain/interfaces/ai-topic.interface';
import { sanitizeDraft } from '../../domain/cv-draft.sanitizer';
import { prepareCvText } from '../../domain/cv-text.prepare';
import { buildCvTextUserPrompt, CV_TEXT_SYSTEM_PROMPT } from './cv-extraction-text.prompt';

export type TIcaDraftOutcome =
  | { readonly ok: true; readonly draft: ICandidateProfileDraft; readonly warnings: readonly string[] }
  | { readonly ok: false; readonly reason: TAiUnavailableReason };

const SCHEMA: IAiOutputSchema = {
  validate: (value) => (typeof value === 'object' && value !== null && !Array.isArray(value) ? null : 'The output must be a JSON object'),
};
const DEFINITION = { systemPrompt: CV_TEXT_SYSTEM_PROMPT, jsonMode: true, outputSchema: SCHEMA } as const;

export const DROPPED_WARNING = 'Algunos valores extraídos no encajaban en el esquema y se descartaron: revisa los datos.';
export const TRUNCATED_WARNING = 'El CV era muy largo y se truncó antes de analizarlo: puede faltar información.';

/**
 * Colaborador compartido (modo `ica-text` y complemento del modo clásico): manda el texto del CV EN LÍNEA
 * (un mensaje de chat, sin subir archivo) y devuelve el borrador validado. Nunca lanza ni loguea contenido.
 */
@Injectable()
export class CvIcaDraftService {
  private readonly logger = new Logger(CvIcaDraftService.name);

  constructor(private readonly ai: AiCoordinatorService) {}

  async draftFromText(rawText: string): Promise<TIcaDraftOutcome> {
    const { text, truncated } = prepareCvText(rawText);
    if (truncated) this.logger.warn(`CV text truncated: chars=${rawText.length}`);
    const answer = await this.ai.askWithDefinition({ definition: DEFINITION, query: buildCvTextUserPrompt(text) });
    if (!answer.ok) return { ok: false, reason: answer.reason };
    const { draft, dropped } = sanitizeDraft(JSON.parse(answer.answer) as unknown);
    if (dropped > 0) this.logger.warn(`CV draft values dropped by the schema: count=${dropped}`);
    return { ok: true, draft, warnings: [...(truncated ? [TRUNCATED_WARNING] : []), ...(dropped > 0 ? [DROPPED_WARNING] : [])] };
  }
}
