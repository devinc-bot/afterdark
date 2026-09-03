import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { findAuthAccountByEmail } from '@repo/db'
import type { LoginInput } from '@repo/validators'
import { TranslationService } from '@repo/i18n/server'
import { verifyValue } from '../../common'
import {
  AuthAccountService,
  type AuthenticatedSession,
  type SessionRequestMetadata,
} from './services/auth-account.service'

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(AuthAccountService) private readonly accounts: AuthAccountService,
    @Inject(TranslationService) private readonly ts: TranslationService
  ) {}

  async execute(
    input: LoginInput,
    metadata: SessionRequestMetadata
  ): Promise<AuthenticatedSession> {
    const row = await findAuthAccountByEmail(input.email)

    if (!row?.account.password) {
      throw new UnauthorizedException(this.ts.translateError('auth.INVALID_CREDENTIALS'))
    }

    const passwordMatches = await verifyValue(input.password, row.account.password)

    if (!passwordMatches) {
      throw new UnauthorizedException(this.ts.translateError('auth.INVALID_CREDENTIALS'))
    }

    return this.accounts.createSession(row, metadata)
  }
}
