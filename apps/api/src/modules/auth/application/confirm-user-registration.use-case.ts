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
  insertAccountLegalAcceptances,
  markUserRegistrationTokenUsed,
  registerAccount,
} from '@repo/db'
import { AUTH_ERROR_CODE } from '@repo/i18n'
import { TranslationService } from '@repo/i18n/server'
import { AUTH_PROVIDER, USER_ROLE } from '@repo/types'
import type { ConfirmUserRegistrationInput } from '@repo/validators'
import {
  loadPublishedRegistrationDocumentIds,
  recordRegistrationLegalAcceptances,
  USER_REGISTRATION_LEGAL_DOCUMENT_TYPES,
} from './record-registration-legal-acceptances.ts'
import {
  AuthAccountService,
  type AuthenticatedSession,
  type SessionRequestMetadata,
} from './services/auth-account.service'
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

  async execute(
    input: ConfirmUserRegistrationInput,
    metadata: SessionRequestMetadata
  ): Promise<AuthenticatedSession> {
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
        await recordRegistrationLegalAcceptances(
          this.ts,
          existingAccount.account.id,
          USER_REGISTRATION_LEGAL_DOCUMENT_TYPES
        )
        await markUserRegistrationTokenUsed(registrationToken.id)
      }

      return this.accounts.createSession(existingAccount, metadata)
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

    const legalDocumentIds = await loadPublishedRegistrationDocumentIds(
      this.ts,
      USER_REGISTRATION_LEGAL_DOCUMENT_TYPES
    )

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

    const created = await findAuthAccountByEmail(registrationToken.email)

    if (!created) {
      throw new InternalServerErrorException(
        this.ts.translateError(AUTH_ERROR_CODE.ROLE_NOT_CONFIGURED)
      )
    }

    await insertAccountLegalAcceptances({
      accountId: created.account.id,
      legalDocumentIds,
    })
    await markUserRegistrationTokenUsed(registrationToken.id)

    return this.accounts.createSession(created, metadata)
  }
}
