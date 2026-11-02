import { BadRequestException, Catch, type ExceptionFilter, type ArgumentsHost, PayloadTooLargeException } from '@nestjs/common';
import type { Response } from 'express';

/** Multer corta una subida enorme con 413; el contrato de CAND-2 dice 400 para "archivo demasiado grande". */
@Catch(PayloadTooLargeException)
export class CvUploadTooLargeFilter implements ExceptionFilter {
  catch(_exception: PayloadTooLargeException, host: ArgumentsHost): void {
    const error = new BadRequestException('The CV file is too large');
    host.switchToHttp().getResponse<Response>().status(error.getStatus()).json(error.getResponse());
  }
}
