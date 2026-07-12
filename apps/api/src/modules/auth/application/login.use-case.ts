import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { findAuthAccountByEmail } from '@afterdark/db'
import type { LoginResponse } from '@afterdark/types'
import type { LoginInput } from '@afterdark/validators'
import { TranslationService } from '@afterdark/i18n/server'
import { verifyValue } from '../../common'
import { AuthAccountService } from './services/auth-account.service'

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(AuthAccountService) private readonly accounts: AuthAccountService,
    @Inject(TranslationService) private readonly ts: TranslationService
  ) {}

  async execute(input: LoginInput): Promise<LoginResponse> {
    const row = await findAuthAccountByEmail(input.email)

    if (!row?.account.password) {
      throw new UnauthorizedException(this.ts.translateError('auth.INVALID_CREDENTIALS'))
    }

    const passwordMatches = await verifyValue(input.password, row.account.password)

    if (!passwordMatches) {
      throw new UnauthorizedException(this.ts.translateError('auth.INVALID_CREDENTIALS'))
    }

    return this.accounts.createAccessToken(row)
  }
}
