import { IsMongoId } from 'class-validator';

/** Parámetro `:id` de `/candidates/:id`: un id mal formado es 400, nunca un error de cast de Mongo. */
export class CandidateIdParamDto {
  @IsMongoId()
  id!: string;
}
