import { IsMongoId } from 'class-validator';

/** Parámetro `:id` de `/processes/:id`: un id mal formado es 400, nunca un error de cast de Mongo. */
export class ProcessIdParamDto {
  @IsMongoId()
  id!: string;
}
