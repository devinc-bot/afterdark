import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common'
import { Resend } from 'resend'
import { MAIL_ERROR_CODE } from '@repo/i18n/constants'
import { TranslationService } from '@repo/i18n/server'
import { ENV } from '../../../config/env'
import type { MailSender } from '../mail-sender.port'
import type { SendMailInput, SendMailResult } from '../types'

@Injectable()
export class ResendMailSender implements MailSender {
  private readonly client: Resend | null
  private readonly logger = new Logger(ResendMailSender.name)

  constructor(@Inject(TranslationService) private readonly ts: TranslationService) {
    this.client = ENV.RESEND_API_KEY ? new Resend(ENV.RESEND_API_KEY) : null
  }

  async send(input: SendMailInput): Promise<SendMailResult> {
    if (!this.client || !ENV.MAIL_FROM) {
      throw new ServiceUnavailableException(this.ts.translateError(MAIL_ERROR_CODE.NOT_CONFIGURED))
    }

    const { data, error } = await this.client.emails.send({
      from: ENV.MAIL_FROM,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    })

    if (error || !data?.id) {
      this.logger.error(`Resend send failed: ${error?.message ?? 'missing email id'}`, error)
      throw new InternalServerErrorException(this.ts.translateError(MAIL_ERROR_CODE.SEND_FAILED))
    }

    return { id: data.id }
  }
}
