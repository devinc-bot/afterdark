import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { hashValue } from '../../../common'
import {
  accountExistsByEmail,
  findAuthAccountByEmail,
  findOwnerStatusByDocumentId,
  findRoleByName,
  registerAccount,
} from '@repo/db'
import {
  AUTH_PROVIDER,
  OWNER_STATUS,
  type LoginResponse,
  type RegisterResponse,
  type UserRole,
  USER_ROLE,
} from '@repo/types'
import type { RegisterUserInput } from '@repo/validators'
import { TranslationService } from '@repo/i18n/server'

type AuthAccountRow = NonNullable<Awaited<ReturnType<typeof findAuthAccountByEmail>>>

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

  async createAccessToken(row: AuthAccountRow): Promise<LoginResponse> {
    if (row.role.name === USER_ROLE.OWNER) {
      const status = await findOwnerStatusByDocumentId(row.sub)

      if (status === OWNER_STATUS.PENDING) {
        throw new UnauthorizedException(this.ts.translateError('auth.OWNER_PENDING_APPROVAL'))
      }
    }

    const accessToken = await this.jwtService.signAsync({
      sub: row.sub,
      email: row.account.email,
      role: row.role.name,
    })

    return { accessToken }
  }
}
