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
  countOwnerRegistrationTokensForEmailSince,
  createOwnerRegistrationToken,
  invalidatePendingOwnerRegistrationTokensForEmail,
} from '@repo/db'
import { AUTH_ERROR_CODE } from '@repo/i18n'
import { TranslationService } from '@repo/i18n/server'
import type { RegisterOwnerInput } from '@repo/validators'
import { ENV } from '../../../config/env'
import { hashValue } from '../../common'
import { SendUserRegistrationUseCase } from '../../mail'
import {
  OWNER_REGISTRATION_MAX_ATTEMPTS_PER_DAY,
  OWNER_REGISTRATION_TOKEN_TTL_MINUTES,
} from '../auth.constants'
import { buildOwnerRegistrationPayload } from '../utils/owner-registration.utils'

function startOfUtcDay(now = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
}

@Injectable()
export class RequestOwnerRegistrationUseCase {
  private readonly logger = new Logger(RequestOwnerRegistrationUseCase.name)

  constructor(
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(TranslationService) private readonly ts: TranslationService,
    @Inject(SendUserRegistrationUseCase)
    private readonly sendUserRegistration: SendUserRegistrationUseCase
  ) {}

  async execute(input: RegisterOwnerInput): Promise<void> {
    if (await accountExistsByEmail(input.email)) {
      throw new ConflictException(this.ts.translateError(AUTH_ERROR_CODE.EMAIL_ALREADY_REGISTERED))
    }

    const attemptsToday = await countOwnerRegistrationTokensForEmailSince(
      input.email,
      startOfUtcDay()
    )

    if (attemptsToday >= OWNER_REGISTRATION_MAX_ATTEMPTS_PER_DAY) {
      throw new HttpException(
        this.ts.translateError(AUTH_ERROR_CODE.USER_REGISTRATION_RATE_LIMITED),
        HttpStatus.TOO_MANY_REQUESTS
      )
    }

    await invalidatePendingOwnerRegistrationTokensForEmail(input.email)

    const expiresInSeconds = OWNER_REGISTRATION_TOKEN_TTL_MINUTES * 60
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000)
    const passwordHash = await hashValue(input.password)
    const payload = buildOwnerRegistrationPayload({ email: input.email })
    const token = await this.jwtService.signAsync(payload, { expiresIn: expiresInSeconds })

    await createOwnerRegistrationToken({
      token,
      email: input.email,
      name: input.name,
      lastName: input.lastName,
      passwordHash,
      expiresAt,
    })

    const url = new URL(CLIENT_ROUTES.registerConfirm(), ENV.DASHBOARD_URL)
    url.searchParams.set('token', token)

    try {
      await this.sendUserRegistration.execute(input.email, {
        url: url.toString(),
        minutes: OWNER_REGISTRATION_TOKEN_TTL_MINUTES,
      })
    } catch (error) {
      this.logger.error(
        `Failed to send owner registration email for ${input.email}`,
        error instanceof Error ? error.stack : undefined
      )
    }
  }
}
