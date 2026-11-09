import { BadRequestException, Catch, type ArgumentsHost, type ExceptionFilter, PayloadTooLargeException } from '@nestjs/common';
import type { Response } from 'express';

/** Multer corta una subida enorme con 413; el contrato de este endpoint dice 400 para "archivo demasiado grande". */
@Catch(PayloadTooLargeException)
export class OpportunitySourceTooLargeFilter implements ExceptionFilter {
  catch(_exception: PayloadTooLargeException, host: ArgumentsHost): void {
    const error = new BadRequestException('The brochure file is too large');
    host.switchToHttp().getResponse<Response>().status(error.getStatus()).json(error.getResponse());
  }
}
