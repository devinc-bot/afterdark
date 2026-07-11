import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import {
  countPasswordResetTokensForAccountSince,
  createPasswordResetToken,
  findAuthAccountByEmail,
  invalidatePendingPasswordResetTokensForAccount,
} from '@afterdark/db'
import { AUTH_ERROR_CODE } from '@afterdark/i18n'
import { TranslationService } from '@afterdark/i18n/server'
import { USER_ROLE, type UserRole } from '@afterdark/types'
import type { ForgotPasswordInput } from '@afterdark/validators'
import { SendPasswordResetUseCase } from '../../mail'
import { ENV } from '../../common/config/env'
import {
  PASSWORD_RESET_MAX_ATTEMPTS_PER_DAY,
  PASSWORD_RESET_TOKEN_TTL_MINUTES,
} from '../auth.constants'
import { buildPasswordResetPayload } from '../utils/password-reset.utils'
import { CLIENT_ROUTES } from '@afterdark/common'

const PASSWORD_RESET_ROLES = new Set<UserRole>([USER_ROLE.USER, USER_ROLE.OWNER, USER_ROLE.STAFF])

function startOfUtcDay(now = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
}

function passwordResetAppOrigin(roleName: UserRole): string {
  if (roleName === USER_ROLE.USER) {
    return ENV.WEB_URL
  }
  return ENV.DASHBOARD_URL
}

@Injectable()
export class ForgotPasswordUseCase {
  private readonly logger = new Logger(ForgotPasswordUseCase.name)

  constructor(
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(TranslationService) private readonly ts: TranslationService,
    @Inject(SendPasswordResetUseCase)
    private readonly sendPasswordReset: SendPasswordResetUseCase
  ) {}

  async execute(input: ForgotPasswordInput): Promise<void> {
    const row = await findAuthAccountByEmail(input.email)

    if (!row) {
      return
    }

    const roleName = row.role.name as UserRole
    if (!PASSWORD_RESET_ROLES.has(roleName)) {
      return
    }

    const attemptsToday = await countPasswordResetTokensForAccountSince(
      row.account.id,
      startOfUtcDay()
    )

    if (attemptsToday >= PASSWORD_RESET_MAX_ATTEMPTS_PER_DAY) {
      throw new HttpException(
        this.ts.translateError(AUTH_ERROR_CODE.PASSWORD_RESET_RATE_LIMITED),
        HttpStatus.TOO_MANY_REQUESTS
      )
    }

    await invalidatePendingPasswordResetTokensForAccount(row.account.id)

    const expiresInSeconds = PASSWORD_RESET_TOKEN_TTL_MINUTES * 60
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000)
    const payload = buildPasswordResetPayload({
      accountId: row.account.id,
      email: row.account.email,
    })
    const token = await this.jwtService.signAsync(payload, { expiresIn: expiresInSeconds })

    await createPasswordResetToken({
      accountId: row.account.id,
      token,
      expiresAt,
    })

    const url = new URL(CLIENT_ROUTES.resetPassword(), passwordResetAppOrigin(roleName))
    url.searchParams.set('token', token)

    try {
      await this.sendPasswordReset.execute(row.account.email, {
        url: url.toString(),
        minutes: PASSWORD_RESET_TOKEN_TTL_MINUTES,
      })
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email for account ${row.account.id}`,
        error instanceof Error ? error.stack : undefined
      )
    }
  }
}
