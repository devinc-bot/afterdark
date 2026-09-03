import { createHash } from 'node:crypto'
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { InjectThrottlerStorage, ThrottlerStorage } from '@nestjs/throttler'
import { RATE_LIMIT_ERROR_CODE } from '@repo/i18n/constants'
import { TranslationService } from '@repo/i18n/server'
import { RATE_LIMIT_POLICY } from '../../../config/env.ts'
import { UserRateLimit } from '../decorators/user-rate-limit.decorator.ts'

const USER_THROTTLER_NAME = 'user' as const
const RATE_LIMIT_HEADER_PREFIX = 'X-RateLimit' as const

type RequestWithUser = {
  user?: {
    sub?: string
  }
}

type ResponseWithHeader = {
  header: (name: string, value: string | number) => unknown
}

@Injectable()
export class UserRateLimitGuard implements CanActivate {
  constructor(
    @InjectThrottlerStorage() private readonly storage: ThrottlerStorage,
    @Inject(Reflector) private readonly reflector: Reflector,
    @Inject(TranslationService) private readonly ts: TranslationService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const handler = context.getHandler()
    const classRef = context.getClass()
    const profile = this.reflector.getAllAndOverride(UserRateLimit, [handler, classRef])

    if (!profile) {
      return true
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>()
    const sub = request.user?.sub
    if (typeof sub !== 'string' || sub.length === 0) {
      return true
    }

    const budget = RATE_LIMIT_POLICY[profile]
    const key = createHash('sha256')
      .update(`${classRef.name}-${handler.name}-${USER_THROTTLER_NAME}-${profile}-${sub}`)
      .digest('hex')

    const { timeToExpire, isBlocked, timeToBlockExpire } = await this.storage.increment(
      key,
      budget.ttlMs,
      budget.limit,
      budget.ttlMs,
      USER_THROTTLER_NAME
    )

    if (!isBlocked) {
      return true
    }

    const response = context.switchToHttp().getResponse<ResponseWithHeader>()
    response.header('Retry-After', timeToBlockExpire)
    response.header(`${RATE_LIMIT_HEADER_PREFIX}-Limit`, budget.limit)
    response.header(`${RATE_LIMIT_HEADER_PREFIX}-Remaining`, 0)
    response.header(`${RATE_LIMIT_HEADER_PREFIX}-Reset`, timeToExpire)

    throw new HttpException(
      this.ts.translateError(RATE_LIMIT_ERROR_CODE.TOO_MANY_REQUESTS),
      HttpStatus.TOO_MANY_REQUESTS
    )
  }
}
