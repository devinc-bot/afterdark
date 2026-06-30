import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { compare, hash } from 'bcryptjs'
import {
  accountExistsByEmail,
  findAuthAccountByEmail,
  findRoleByName,
  registerAccount,
} from '@afterdark/db'
import {
  USER_ROLE,
  type LoginResponse,
  type RegisterResponse,
  type UserRole,
} from '@afterdark/types'
import type { LoginInput, RegisterOwnerInput, RegisterUserInput } from '@afterdark/validators'
import { TranslationService } from '@afterdark/i18n/server'

const PASSWORD_SALT_ROUNDS = 10

@Injectable()
export class AuthService {
  constructor(
    @Inject(JwtService) private readonly jwtService: JwtService,
    private readonly ts: TranslationService
  ) {}

  async login(input: LoginInput): Promise<LoginResponse> {
    const row = await findAuthAccountByEmail(input.email)

    if (!row) {
      throw new UnauthorizedException(this.ts.translateError('auth.INVALID_CREDENTIALS'))
    }

    const passwordMatches = await compare(input.password, row.account.password)

    if (!passwordMatches) {
      throw new UnauthorizedException(this.ts.translateError('auth.INVALID_CREDENTIALS'))
    }

    return this.createAccessToken(row)
  }

  async registerUser(input: RegisterUserInput): Promise<RegisterResponse> {
    return this.register(input, USER_ROLE.USER)
  }

  async registerOwner(input: RegisterOwnerInput): Promise<RegisterResponse> {
    return this.register(input, USER_ROLE.OWNER)
  }

  private async register(input: RegisterUserInput, roleName: UserRole): Promise<RegisterResponse> {
    if (await accountExistsByEmail(input.email)) {
      throw new ConflictException(this.ts.translateError('auth.EMAIL_ALREADY_REGISTERED'))
    }

    const role = await findRoleByName(roleName)

    if (!role) {
      throw new InternalServerErrorException(this.ts.translateError('auth.ROLE_NOT_CONFIGURED'))
    }

    const hashedPassword = await hash(input.password, PASSWORD_SALT_ROUNDS)

    await registerAccount({
      email: input.email,
      hashedPassword,
      roleId: role.id,
      roleName,
      profile: {
        name: input.name,
        lastName: input.lastName,
        phone: '',
      },
    })

    return { message: this.ts.translateError('auth.REGISTER_SUCCESS') }
  }

  private async createAccessToken(
    row: NonNullable<Awaited<ReturnType<typeof findAuthAccountByEmail>>>
  ): Promise<LoginResponse> {
    const accessToken = await this.jwtService.signAsync({
      sub: row.sub,
      email: row.account.email,
      role: row.role.name,
    })

    return { accessToken }
  }
}
