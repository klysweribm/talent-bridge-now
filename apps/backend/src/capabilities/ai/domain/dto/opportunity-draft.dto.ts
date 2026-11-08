import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { OPPORTUNITY_DRAFT_MESSAGES } from '../opportunity-draft/opportunity-draft.constants';

/** El tope de longitud NO va aquí: es configurable (`OPPORTUNITY_DRAFT_MAX_TEXT_CHARS`) y lo comprueba el servicio. */
export class OpportunityDraftDto {
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: OPPORTUNITY_DRAFT_MESSAGES.textRequired })
  @IsNotEmpty({ message: OPPORTUNITY_DRAFT_MESSAGES.textRequired })
  readonly text!: string;
}
