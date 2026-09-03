import { Throttle } from '@nestjs/throttler'
import { RATE_LIMIT_POLICY } from '../../../config/env.ts'
import type { RateLimitProfile } from '../../../config/rate-limit.policy.ts'

export function ApiRateLimit(profile: RateLimitProfile) {
  const budget = RATE_LIMIT_POLICY[profile]
  return Throttle({ default: { limit: budget.limit, ttl: budget.ttlMs } })
}
