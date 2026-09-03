import { Global, Module } from '@nestjs/common'
import { APP_FILTER, APP_GUARD } from '@nestjs/core'
import { ThrottlerModule } from '@nestjs/throttler'
import { RATE_LIMIT_POLICY } from '../../config/env.ts'
import { RATE_LIMIT_PROFILE } from '../../config/rate-limit.policy.ts'
import { HttpExceptionFilter } from './filters/http-exception.filter.ts'
import { ApiThrottlerGuard } from './guards/api-throttler.guard.ts'
import { UserRateLimitGuard } from './guards/user-rate-limit.guard.ts'
import { ApiErrorRetentionScheduler } from './services/api-error-retention.scheduler.ts'
import { ApiErrorRecorderService } from './services/api-error-recorder.service.ts'
import { DatabaseLifecycleService } from './services/database-lifecycle.service.ts'

const publicBudget = RATE_LIMIT_POLICY[RATE_LIMIT_PROFILE.PUBLIC]

@Global()
@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'default',
        limit: publicBudget.limit,
        ttl: publicBudget.ttlMs,
      },
    ]),
  ],
  providers: [
    ApiErrorRecorderService,
    ApiErrorRetentionScheduler,
    DatabaseLifecycleService,
    UserRateLimitGuard,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ApiThrottlerGuard,
    },
  ],
  exports: [ApiErrorRecorderService, UserRateLimitGuard],
})
export class CommonModule {}
