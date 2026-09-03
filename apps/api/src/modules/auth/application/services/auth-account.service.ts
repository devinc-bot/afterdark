import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { createHmac, randomBytes } from 'node:crypto'
import { hashValue } from '../../../common'
import {
  accountExistsByEmail,
  createAccountSession,
  findAuthAccountByEmail,
  findOwnerStatusByDocumentId,
  findRoleByName,
  registerAccount,
} from '@repo/db'
import {
  AUTH_PROVIDER,
  OWNER_STATUS,
  type LoginResponse,
  type ClientApp,
  type SessionMetadata,
  type RegisterResponse,
  type UserRole,
  USER_ROLE,
} from '@repo/types'
import type { RegisterUserInput } from '@repo/validators'
import { TranslationService } from '@repo/i18n/server'
import { ENV } from '../../../../config/env'
import { CLIENT_APP_BY_USER_ROLE, REFRESH_SESSION_TTL_DAYS } from '../../auth.constants'

type AuthAccountRow = NonNullable<Awaited<ReturnType<typeof findAuthAccountByEmail>>>

export type SessionRequestMetadata = Pick<
  SessionMetadata,
  'ipAddress' | 'device' | 'userAgent' | 'city' | 'state' | 'country'
>

export type AuthenticatedSession = LoginResponse & {
  clientApp: ClientApp
  refreshToken: string
}

// one day in milliseconds
const DAY_IN_MS = 24 * 60 * 60 * 1000

@Injectable()
export class AuthAccountService {
  constructor(
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(TranslationService) private readonly ts: TranslationService
  ) {}

  async register(input: RegisterUserInput, roleName: UserRole): Promise<RegisterResponse> {
    if (await accountExistsByEmail(input.email)) {
      throw new ConflictException(this.ts.translateError('auth.EMAIL_ALREADY_REGISTERED'))
    }

    const role = await findRoleByName(roleName)

    if (!role) {
      throw new InternalServerErrorException(this.ts.translateError('auth.ROLE_NOT_CONFIGURED'))
    }

    const hashedPassword = await hashValue(input.password)

    await registerAccount({
      email: input.email,
      hashedPassword,
      roleId: role.id,
      roleName,
      provider: AUTH_PROVIDER.LOCAL,
      providerAccountId: null,
      profile: {
        name: input.name,
        lastName: input.lastName,
        phone: '',
      },
    })

    return { message: this.ts.translateError('auth.REGISTER_SUCCESS') }
  }

  async createSession(
    row: AuthAccountRow,
    metadata: SessionRequestMetadata,
    clientApp = CLIENT_APP_BY_USER_ROLE[row.role.name as UserRole]
  ): Promise<AuthenticatedSession> {
    if (row.role.name === USER_ROLE.OWNER) {
      const status = await findOwnerStatusByDocumentId(row.sub)

      if (status === OWNER_STATUS.PENDING) {
        throw new UnauthorizedException(this.ts.translateError('auth.OWNER_PENDING_APPROVAL'))
      }
    }

    const refreshSecret = randomBytes(32).toString('base64url')
    const expiresAt = new Date(Date.now() + REFRESH_SESSION_TTL_DAYS * DAY_IN_MS)
    const session = await createAccountSession({
      accountId: row.account.id,
      clientApp,
      refreshTokenHash: await hashValue(refreshSecret),
      refreshTokenVersion: 0,
      expiresAt,
      ...metadata,
    })
    const accessToken = await this.jwtService.signAsync({
      sub: row.sub,
      email: row.account.email,
      role: row.role.name,
      sessionDocumentId: session.documentId,
    })

    const refreshToken = [
      session.documentId,
      session.refreshTokenVersion,
      refreshSecret,
      this.createRefreshTokenMac(session.documentId, session.refreshTokenVersion, refreshSecret),
    ].join('.')

    return { accessToken, clientApp, refreshToken }
  }

  private createRefreshTokenMac(
    sessionDocumentId: string,
    refreshTokenVersion: number,
    refreshSecret: string
  ): string {
    return createHmac('sha256', ENV.REFRESH_TOKEN_SECRET)
      .update(`${sessionDocumentId}.${refreshTokenVersion}.${refreshSecret}`)
      .digest('base64url')
  }
}
