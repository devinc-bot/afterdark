import { Inject, Injectable, ServiceUnavailableException } from '@nestjs/common'
import { MAIL_ERROR_CODE } from '@repo/i18n/constants'
import { TranslationService } from '@repo/i18n/server'
import { ENV } from '../../../common/config/env'

@Injectable()
export class MailConfigService {
  constructor(@Inject(TranslationService) private readonly ts: TranslationService) {}

  isConfigured(): boolean {
    return Boolean(ENV.RESEND_API_KEY && ENV.MAIL_FROM)
  }

  assertConfigured(): void {
    if (!this.isConfigured()) {
      throw new ServiceUnavailableException(this.ts.translateError(MAIL_ERROR_CODE.NOT_CONFIGURED))
    }
  }
}
