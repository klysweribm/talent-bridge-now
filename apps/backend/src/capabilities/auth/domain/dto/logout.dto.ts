import { IsIn } from 'class-validator';
import { LOGOUT_REASONS, type TLogoutReason } from '../interfaces/auth-event.interface';

export class LogoutDto {
  @IsIn(LOGOUT_REASONS)
  readonly reason!: TLogoutReason;
}
