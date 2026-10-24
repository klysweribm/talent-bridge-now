import { IsEmail } from 'class-validator';

export class DevLoginDto {
  @IsEmail()
  readonly email!: string;
}
