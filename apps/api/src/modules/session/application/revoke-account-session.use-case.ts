import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { findAuthAccountByEmail, revokeManagedAccountSession } from '@repo/db'
import type { ClientApp, JwtPayload } from '@repo/types'
import { TranslationService } from '@repo/i18n/server'

@Injectable()
export class RevokeAccountSessionUseCase {
  constructor(@Inject(TranslationService) private readonly ts: TranslationService) {}

  async execute(payload: JwtPayload, clientApp: ClientApp, documentId: string): Promise<void> {
    const account = await findAuthAccountByEmail(payload.email)
    const revoked =
      account &&
      (await revokeManagedAccountSession({
        accountId: account.account.id,
        clientApp,
        documentId,
        currentSessionDocumentId: payload.sessionDocumentId,
      }))

    if (!revoked) {
      throw new NotFoundException(this.ts.translateError('auth.SESSION_NOT_FOUND'))
    }
  }
}
