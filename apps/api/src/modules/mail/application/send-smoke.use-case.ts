import { Inject, Injectable, ServiceUnavailableException } from '@nestjs/common'
import { MAIL_ERROR_CODE } from '@repo/i18n/constants'
import { TranslationService } from '@repo/i18n/server'
import { ENV } from '../../../config/env'
import type { SendMailResult } from '../types'
import { SendWelcomeUseCase } from './send-welcome.use-case'

@Injectable()
export class SendSmokeUseCase {
  constructor(
    @Inject(SendWelcomeUseCase) private readonly sendWelcome: SendWelcomeUseCase,
    @Inject(TranslationService) private readonly ts: TranslationService
  ) {}

  async execute(): Promise<SendMailResult> {
    if (!ENV.isDevelopment) {
      throw new ServiceUnavailableException(this.ts.translateError(MAIL_ERROR_CODE.NOT_CONFIGURED))
    }

    if (!ENV.MAIL_SMOKE_TO) {
      throw new ServiceUnavailableException(this.ts.translateError(MAIL_ERROR_CODE.NOT_CONFIGURED))
    }

    return this.sendWelcome.execute(ENV.MAIL_SMOKE_TO, {
      name: 'Smoke',
      ctaUrl: ENV.DASHBOARD_URL,
    })
  }
}
