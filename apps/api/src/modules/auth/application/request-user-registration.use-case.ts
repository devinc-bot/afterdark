import {
  ConflictException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { CLIENT_ROUTES } from '@repo/common'
import {
  accountExistsByEmail,
  countUserRegistrationTokensForEmailSince,
  createUserRegistrationToken,
  invalidatePendingUserRegistrationTokensForEmail,
} from '@repo/db'
import { AUTH_ERROR_CODE } from '@repo/i18n'
import { TranslationService } from '@repo/i18n/server'
import type { RegisterUserInput } from '@repo/validators'
import { ENV } from '../../common/config/env'
import { hashValue } from '../../common'
import { SendUserRegistrationUseCase } from '../../mail'
import {
  USER_REGISTRATION_MAX_ATTEMPTS_PER_DAY,
  USER_REGISTRATION_TOKEN_TTL_MINUTES,
} from '../auth.constants'
import { buildUserRegistrationPayload } from '../utils/user-registration.utils'

function startOfUtcDay(now = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
}

@Injectable()
export class RequestUserRegistrationUseCase {
  private readonly logger = new Logger(RequestUserRegistrationUseCase.name)

  constructor(
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(TranslationService) private readonly ts: TranslationService,
    @Inject(SendUserRegistrationUseCase)
    private readonly sendUserRegistration: SendUserRegistrationUseCase
  ) {}

  async execute(input: RegisterUserInput): Promise<void> {
    if (await accountExistsByEmail(input.email)) {
      throw new ConflictException(this.ts.translateError(AUTH_ERROR_CODE.EMAIL_ALREADY_REGISTERED))
    }

    const attemptsToday = await countUserRegistrationTokensForEmailSince(
      input.email,
      startOfUtcDay()
    )

    if (attemptsToday >= USER_REGISTRATION_MAX_ATTEMPTS_PER_DAY) {
      throw new HttpException(
        this.ts.translateError(AUTH_ERROR_CODE.USER_REGISTRATION_RATE_LIMITED),
        HttpStatus.TOO_MANY_REQUESTS
      )
    }

    await invalidatePendingUserRegistrationTokensForEmail(input.email)

    const expiresInSeconds = USER_REGISTRATION_TOKEN_TTL_MINUTES * 60
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000)
    const passwordHash = await hashValue(input.password)
    const payload = buildUserRegistrationPayload({ email: input.email })
    const token = await this.jwtService.signAsync(payload, { expiresIn: expiresInSeconds })

    await createUserRegistrationToken({
      token,
      email: input.email,
      name: input.name,
      lastName: input.lastName,
      passwordHash,
      expiresAt,
    })

    const url = new URL(CLIENT_ROUTES.registerConfirm(), ENV.WEB_URL)
    url.searchParams.set('token', token)

    try {
      await this.sendUserRegistration.execute(input.email, {
        url: url.toString(),
        minutes: USER_REGISTRATION_TOKEN_TTL_MINUTES,
      })
    } catch (error) {
      this.logger.error(
        `Failed to send user registration email for ${input.email}`,
        error instanceof Error ? error.stack : undefined
      )
    }
  }
}
