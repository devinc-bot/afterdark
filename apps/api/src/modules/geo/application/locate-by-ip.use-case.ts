import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common'
import { GEO_ERROR_CODE } from '@repo/i18n'
import { TranslationService } from '@repo/i18n/server'
import type { GeoIpLocateResult } from '@repo/types'
import type { GeoIpLocator } from '../geo-ip-locator.port'
import { GEO_IP_LOCATOR } from '../geo.tokens'
import { GeoRateLimitService } from './services/geo-rate-limit.service'

@Injectable()
export class LocateByIpUseCase {
  constructor(
    @Inject(GEO_IP_LOCATOR) private readonly locator: GeoIpLocator,
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
