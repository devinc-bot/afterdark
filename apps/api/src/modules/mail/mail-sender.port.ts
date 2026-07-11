import type { SendMailInput, SendMailResult } from './types'

export interface MailSender {
  send(input: SendMailInput): Promise<SendMailResult>
}
