import { Transform } from 'class-transformer';
import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import type { TAiTopic } from '@ibm-talent-bridge/shared-types';
import { AI_TOPIC_IDS } from '../ai-topics';
import { AI_QUERY_MAX_LENGTH } from '../constants/ai.constants';

export class AskAiDto {
  @IsIn(AI_TOPIC_IDS)
  readonly topic!: TAiTopic;

  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(AI_QUERY_MAX_LENGTH)
  readonly query!: string;
}
