import { Module } from '@nestjs/common'
import { ResendMailSender } from './adapters/resend.mail-sender'
import { SendMailUseCase } from './application/send-mail.use-case'
import { SendPasswordResetUseCase } from './application/send-password-reset.use-case'
import { SendSmokeUseCase } from './application/send-smoke.use-case'
import { SendStaffInvitationUseCase } from './application/send-staff-invitation.use-case'
import { SendUserRegistrationUseCase } from './application/send-user-registration.use-case'
import { SendWelcomeUseCase } from './application/send-welcome.use-case'
import { MailConfigService } from './application/services/mail-config.service'
import { MailTemplatesService } from './application/services/mail-templates.service'
import { MAIL_SENDER } from './mail.tokens'

@Module({
  providers: [
    MailConfigService,
    MailTemplatesService,
    SendMailUseCase,
    SendStaffInvitationUseCase,
    SendPasswordResetUseCase,
    SendUserRegistrationUseCase,
    SendWelcomeUseCase,
    SendSmokeUseCase,
    {
      provide: MAIL_SENDER,
      useClass: ResendMailSender,
    },
  ],
  exports: [
    SendMailUseCase,
    SendStaffInvitationUseCase,
    SendPasswordResetUseCase,
    SendUserRegistrationUseCase,
    SendWelcomeUseCase,
    SendSmokeUseCase,
    MailTemplatesService,
  ],
})
export class MailModule {}
