import { ExecutionContext, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import {
  InjectThrottlerOptions,
  InjectThrottlerStorage,
  ThrottlerGuard,
  ThrottlerModuleOptions,
  ThrottlerStorage,
} from '@nestjs/throttler'
import type { ThrottlerLimitDetail } from '@nestjs/throttler'
import { RATE_LIMIT_ERROR_CODE } from '@repo/i18n/constants'
import { TranslationService } from '@repo/i18n/server'

@Injectable()
export class ApiThrottlerGuard extends ThrottlerGuard {
  constructor(
    @InjectThrottlerOptions() options: ThrottlerModuleOptions,
    @InjectThrottlerStorage() storageService: ThrottlerStorage,
    reflector: Reflector,
    @Inject(TranslationService) private readonly ts: TranslationService
  ) {
    super(options, storageService, reflector)
  }

  protected async getTracker(req: Record<string, unknown>): Promise<string> {
    const ip = req.ip
    if (typeof ip !== 'string' || ip.length === 0) {
      throw new HttpException(
        this.ts.translateError(RATE_LIMIT_ERROR_CODE.CLIENT_IP_REQUIRED),
        HttpStatus.BAD_REQUEST
      )
    }
    return ip
  }

  protected async getErrorMessage(
    _context: ExecutionContext,
    _throttlerLimitDetail: ThrottlerLimitDetail
  ): Promise<string> {
    return this.ts.translateError(RATE_LIMIT_ERROR_CODE.TOO_MANY_REQUESTS)
  }

  protected async throwThrottlingException(
    context: ExecutionContext,
    throttlerLimitDetail: ThrottlerLimitDetail
  ): Promise<void> {
    const { res } = this.getRequestResponse(context)
    res.header(`${this.headerPrefix}-Limit`, throttlerLimitDetail.limit)
    res.header(`${this.headerPrefix}-Remaining`, 0)
    res.header(`${this.headerPrefix}-Reset`, throttlerLimitDetail.timeToExpire)
    await super.throwThrottlingException(context, throttlerLimitDetail)
  }
}
