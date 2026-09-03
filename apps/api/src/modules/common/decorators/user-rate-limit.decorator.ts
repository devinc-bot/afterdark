import { Reflector } from '@nestjs/core'
import type { RateLimitProfile } from '../../../config/rate-limit.policy.ts'

export const UserRateLimit = Reflector.createDecorator<RateLimitProfile>()
