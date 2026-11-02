import { IsMongoId } from 'class-validator';

/** Cuerpo de `POST /processes/:id/candidates` (`IAddProcessCandidateRequest`). */
export class AddProcessCandidateDto {
  @IsMongoId()
  candidateId!: string;
}
