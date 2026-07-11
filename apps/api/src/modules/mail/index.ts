export { MailModule } from './mail.module'
export { SendMailUseCase } from './application/send-mail.use-case'
export { SendStaffInvitationUseCase } from './application/send-staff-invitation.use-case'
export { SendPasswordResetUseCase } from './application/send-password-reset.use-case'
export { SendWelcomeUseCase } from './application/send-welcome.use-case'
export { SendSmokeUseCase } from './application/send-smoke.use-case'
export { MailTemplatesService } from './application/services/mail-templates.service'
export type { MailSender } from './mail-sender.port'
export type {
  PasswordResetRenderInput,
  RenderedMail,
  SendMailInput,
  SendMailResult,
  StaffInvitationRenderInput,
  WelcomeRenderInput,
} from './types'
