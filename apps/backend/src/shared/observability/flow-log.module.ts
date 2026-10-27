import { Global, Module, type MiddlewareConsumer, type NestModule } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { FlowLogInterceptor } from './flow-log.interceptor';
import { FlowLogMiddleware } from './flow-log.middleware';
import { FlowLogService } from './flow-log.service';

@Global()
@Module({
  providers: [
    FlowLogService,
    FlowLogMiddleware,
    { provide: APP_INTERCEPTOR, useClass: FlowLogInterceptor },
  ],
  exports: [FlowLogService],
})
export class FlowLogModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(FlowLogMiddleware).forRoutes('*');
  }
}
