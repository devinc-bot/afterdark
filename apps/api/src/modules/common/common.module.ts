import { Global, Module } from '@nestjs/common'
import { APP_FILTER } from '@nestjs/core'
import { HttpExceptionFilter } from './filters/http-exception.filter.ts'
import { ApiErrorRetentionScheduler } from './services/api-error-retention.scheduler.ts'
import { ApiErrorRecorderService } from './services/api-error-recorder.service.ts'

@Global()
@Module({
  providers: [
    ApiErrorRecorderService,
    ApiErrorRetentionScheduler,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
  exports: [ApiErrorRecorderService],
})
export class CommonModule {}
