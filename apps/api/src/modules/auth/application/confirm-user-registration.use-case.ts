import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import {
  findAuthAccountByEmail,
  findRoleByName,
  findUserRegistrationTokenByToken,
  markUserRegistrationTokenUsed,
  registerAccount,
} from '@repo/db'
import { AUTH_ERROR_CODE } from '@repo/i18n'
import { TranslationService } from '@repo/i18n/server'
import { AUTH_PROVIDER, USER_ROLE, type LoginResponse } from '@repo/types'
import type { ConfirmUserRegistrationInput } from '@repo/validators'
import { AuthAccountService } from './services/auth-account.service'
import {
  USER_REGISTRATION_PURPOSE,
  type UserRegistrationPayload,
} from '../utils/user-registration.utils'

@Injectable()
export class ConfirmUserRegistrationUseCase {
  constructor(
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(TranslationService) private readonly ts: TranslationService,
    @Inject(AuthAccountService) private readonly accounts: AuthAccountService
  ) {}

  async execute(input: ConfirmUserRegistrationInput): Promise<LoginResponse> {
    const registrationToken = await findUserRegistrationTokenByToken(input.token)

    if (!registrationToken) {
      throw new BadRequestException(
        this.ts.translateError(AUTH_ERROR_CODE.USER_REGISTRATION_TOKEN_INVALID)
      )
    }

    const existingAccount = await findAuthAccountByEmail(registrationToken.email)

    // Link already used (or account created) → treat as login instead of failing.
    if (registrationToken.usedAt || existingAccount) {
      if (!existingAccount) {
        throw new BadRequestException(
          this.ts.translateError(AUTH_ERROR_CODE.USER_REGISTRATION_TOKEN_INVALID)
        )
      }

      if (!registrationToken.usedAt) {
        await markUserRegistrationTokenUsed(registrationToken.id)
      }

      return this.accounts.createAccessToken(existingAccount)
    }

    let payload: UserRegistrationPayload

    try {
      payload = await this.jwtService.verifyAsync<UserRegistrationPayload>(input.token)
    } catch {
      throw new BadRequestException(
        this.ts.translateError(AUTH_ERROR_CODE.USER_REGISTRATION_TOKEN_INVALID)
      )
    }

    if (
      payload.purpose !== USER_REGISTRATION_PURPOSE ||
      payload.email !== registrationToken.email
    ) {
      throw new BadRequestException(
        this.ts.translateError(AUTH_ERROR_CODE.USER_REGISTRATION_TOKEN_INVALID)
      )
    }

    if (registrationToken.expiresAt.getTime() <= Date.now()) {
      throw new BadRequestException(
        this.ts.translateError(AUTH_ERROR_CODE.USER_REGISTRATION_TOKEN_INVALID)
      )
    }

    const role = await findRoleByName(USER_ROLE.USER)

    if (!role) {
      throw new InternalServerErrorException(
        this.ts.translateError(AUTH_ERROR_CODE.ROLE_NOT_CONFIGURED)
      )
    }

    await registerAccount({
      email: registrationToken.email,
      hashedPassword: registrationToken.passwordHash,
      roleId: role.id,
      roleName: USER_ROLE.USER,
      provider: AUTH_PROVIDER.LOCAL,
      providerAccountId: null,
      profile: {
        name: registrationToken.name,
        lastName: registrationToken.lastName,
        phone: '',
      },
    })

    await markUserRegistrationTokenUsed(registrationToken.id)

    const created = await findAuthAccountByEmail(registrationToken.email)

    if (!created) {
      throw new InternalServerErrorException(
        this.ts.translateError(AUTH_ERROR_CODE.ROLE_NOT_CONFIGURED)
      )
    }

    return this.accounts.createAccessToken(created)
  }
}
