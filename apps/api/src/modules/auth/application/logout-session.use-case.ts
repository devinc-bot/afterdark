import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { findAccountSessionForRefresh, revokeAccountSession } from '@repo/db'
import type { ClientApp } from '@repo/types'
import { TranslationService } from '@repo/i18n/server'
import { verifyValue } from '../../common'
import { parseAndVerifyRefreshToken } from './refresh-token.utils'

@Injectable()
export class LogoutSessionUseCase {
  constructor(@Inject(TranslationService) private readonly ts: TranslationService) {}

  async execute(clientApp: ClientApp, refreshToken: string): Promise<void> {
    const credential = parseAndVerifyRefreshToken(refreshToken)
    if (!credential) {
      throw new UnauthorizedException(this.ts.translateError('auth.REFRESH_TOKEN_INVALID'))
    }

    const row = await findAccountSessionForRefresh(credential.sessionDocumentId, clientApp)
    if (
      !row ||
      row.session.refreshTokenVersion !== credential.version ||
      !(await verifyValue(credential.secret, row.session.refreshTokenHash))
    ) {
      return
    }

    await revokeAccountSession({
      documentId: credential.sessionDocumentId,
      clientApp,
      expectedRefreshTokenHash: row.session.refreshTokenHash,
      expectedRefreshTokenVersion: credential.version,
    })
  }
}
