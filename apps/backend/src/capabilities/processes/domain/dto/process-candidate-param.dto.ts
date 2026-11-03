import { IsMongoId } from 'class-validator';

/** Parámetros de `DELETE /processes/:id/candidates/:candidateId`. */
export class ProcessCandidateParamDto {
  @IsMongoId()
  id!: string;

  @IsMongoId()
  candidateId!: string;
}
