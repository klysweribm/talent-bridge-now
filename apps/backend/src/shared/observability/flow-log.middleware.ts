import { randomBytes } from 'node:crypto';
import { Injectable, type NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { flowStorage, type IFlowContext } from './flow-context';
import {
  REJECTED_BEFORE_HANDLER_NOTE,
  formatRequest,
  formatResponse,
} from './flow-log.format';
import { FlowLogService } from './flow-log.service';

const ID_BYTES = 3;

@Injectable()
export class FlowLogMiddleware implements NestMiddleware {
  constructor(private readonly flowLog: FlowLogService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    if (!this.flowLog.enabled || this.flowLog.isIgnoredPath(req.originalUrl)) {
      next();
      return;
    }

    const context: IFlowContext = {
      id: randomBytes(ID_BYTES).toString('hex'),
      startedAt: Date.now(),
      reachedHandler: false,
      depth: 0,
    };

    res.on('finish', () => {
      if (context.reachedHandler) return;
      this.flowLog.emit(
        formatRequest({
          id: context.id,
          method: req.method,
          url: req.originalUrl,
          headers: req.headers,
          query: req.query,
          body: req.body,
        }),
      );
      this.flowLog.emit(
        formatResponse({
          id: context.id,
          status: res.statusCode,
          elapsedMs: Date.now() - context.startedAt,
          note: REJECTED_BEFORE_HANDLER_NOTE,
        }),
      );
    });

    flowStorage.run(context, () => next());
  }
}
