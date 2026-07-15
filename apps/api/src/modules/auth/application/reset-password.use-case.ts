import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import {
  findValidPasswordResetToken,
  markPasswordResetTokenUsed,
  updateAccountPassword,
} from '@afterdark/db'
import { AUTH_ERROR_CODE } from '@afterdark/i18n'
import { TranslationService } from '@afterdark/i18n/server'
import type { ResetPasswordInput } from '@afterdark/validators'
import { hashValue } from '../../common'
import { PASSWORD_RESET_PURPOSE, type PasswordResetPayload } from '../utils/password-reset.utils'

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(TranslationService) private readonly ts: TranslationService
  ) {}

  async execute(input: ResetPasswordInput): Promise<void> {
    let payload: PasswordResetPayload

    try {
      payload = await this.jwtService.verifyAsync<PasswordResetPayload>(input.token)
    } catch {
      throw new BadRequestException(
        this.ts.translateError(AUTH_ERROR_CODE.PASSWORD_RESET_TOKEN_INVALID)
      )
    }

    if (payload.purpose !== PASSWORD_RESET_PURPOSE) {
      throw new BadRequestException(
        this.ts.translateError(AUTH_ERROR_CODE.PASSWORD_RESET_TOKEN_INVALID)
      )
    }

    const resetToken = await findValidPasswordResetToken(input.token)

    if (!resetToken || resetToken.accountId !== payload.accountId) {
      throw new BadRequestException(
        this.ts.translateError(AUTH_ERROR_CODE.PASSWORD_RESET_TOKEN_INVALID)
      )
    }

    const hashedPassword = await hashValue(input.password)

    await updateAccountPassword(resetToken.accountId, hashedPassword)
    await markPasswordResetTokenUsed(resetToken.id)
  }
}
