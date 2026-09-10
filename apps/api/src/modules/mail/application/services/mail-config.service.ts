import { Inject, Injectable, ServiceUnavailableException } from '@nestjs/common'
import { MAIL_ERROR_CODE } from '@repo/i18n/constants'
import { TranslationService } from '@repo/i18n/server'
import { ENV } from '../../../../config/env'

@Injectable()
export class MailConfigService {
  constructor(@Inject(TranslationService) private readonly ts: TranslationService) {}

  isConfigured(): boolean {
    return ENV.MAIL_FROM.trim().length > 0
  }

  assertConfigured(): void {
    if (!this.isConfigured()) {
      throw new ServiceUnavailableException(this.ts.translateError(MAIL_ERROR_CODE.NOT_CONFIGURED))
    }
  }
}
