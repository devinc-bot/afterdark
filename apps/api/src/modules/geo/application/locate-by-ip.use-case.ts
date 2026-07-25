import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common'
import { GEO_ERROR_CODE } from '@repo/i18n'
import { TranslationService } from '@repo/i18n/server'
import type { GeoIpLocateResult } from '@repo/types'
import { IpQueryLocatorAdapter } from '../adapters/ipquery.locator'
import { GeoRateLimitService } from './services/geo-rate-limit.service'

@Injectable()
export class LocateByIpUseCase {
  constructor(
    @Inject(IpQueryLocatorAdapter) private readonly locator: IpQueryLocatorAdapter,
    @Inject(GeoRateLimitService) private readonly rateLimit: GeoRateLimitService,
    @Inject(TranslationService) private readonly ts: TranslationService
  ) {}

  async execute(accountDocumentId: string, clientIp: string | null): Promise<GeoIpLocateResult> {
    if (!this.rateLimit.consume(accountDocumentId)) {
      throw new HttpException(
        this.ts.translateError(GEO_ERROR_CODE.RATE_LIMITED),
        HttpStatus.TOO_MANY_REQUESTS
      )
    }

    try {
      return await this.locator.locateByIp(clientIp)
    } catch {
      throw new HttpException(
        this.ts.translateError(GEO_ERROR_CODE.PROVIDER_FAILED),
        HttpStatus.BAD_GATEWAY
      )
    }
  }
}
