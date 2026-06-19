import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { compare, hash } from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { accounts, db, roles, userAccountsLnk, users, type Transaction } from '@afterdark/db'
import { USER_ROLE, type LoginResponse } from '@afterdark/types'
import type { LoginInput, RegisterInput } from '@afterdark/validators'
import { AUTH_MESSAGE } from './auth.constants'

const PASSWORD_SALT_ROUNDS = 10

type AuthAccountRow = {
  user: typeof users.$inferSelect
  account: typeof accounts.$inferSelect
  role: typeof roles.$inferSelect
}

@Injectable()
export class AuthService {
  constructor(@Inject(JwtService) private readonly jwtService: JwtService) {}

  async login(input: LoginInput): Promise<LoginResponse> {
    const row = await this.findAccountByEmail(input.email)

    if (!row) {
      throw new UnauthorizedException(AUTH_MESSAGE.INVALID_CREDENTIALS)
    }

    const passwordMatches = await compare(input.password, row.account.password)

    if (!passwordMatches) {
      throw new UnauthorizedException(AUTH_MESSAGE.INVALID_CREDENTIALS)
    }

    return this.createAccessToken(row)
  }

  async register(input: RegisterInput): Promise<LoginResponse> {
    const existingAccount = await this.findAccountByEmail(input.email)

    if (existingAccount) {
      throw new ConflictException(AUTH_MESSAGE.EMAIL_ALREADY_REGISTERED)
    }

    const [ownerRole] = await db
      .select()
      .from(roles)
      .where(eq(roles.name, USER_ROLE.OWNER))
      .limit(1)

    if (!ownerRole) {
      throw new InternalServerErrorException(AUTH_MESSAGE.ROLE_NOT_CONFIGURED)
    }

    const hashedPassword = await hash(input.password, PASSWORD_SALT_ROUNDS)

    const row = await db.transaction(async (tx: Transaction) => {
      const [user] = await tx
        .insert(users)
        .values({
          name: input.name,
          lastName: input.lastName,
          phone: '',
        })
        .returning()

      const [account] = await tx
        .insert(accounts)
        .values({
          email: input.email,
          password: hashedPassword,
        })
        .returning()

      await tx.insert(userAccountsLnk).values({
        userId: user.id,
        accountId: account.id,
        roleId: ownerRole.id,
      })

      return {
        user,
        account,
        role: ownerRole,
      } satisfies AuthAccountRow
    })

    return this.createAccessToken(row)
  }

  private async findAccountByEmail(email: string): Promise<AuthAccountRow | null> {
    const [row] = await db
      .select({
        user: users,
        account: accounts,
        role: roles,
      })
      .from(accounts)
      .innerJoin(userAccountsLnk, eq(userAccountsLnk.accountId, accounts.id))
      .innerJoin(users, eq(users.id, userAccountsLnk.userId))
      .innerJoin(roles, eq(roles.id, userAccountsLnk.roleId))
      .where(eq(accounts.email, email))
      .limit(1)

    return row ?? null
  }

  private async createAccessToken(row: AuthAccountRow): Promise<LoginResponse> {
    const accessToken = await this.jwtService.signAsync({
      sub: row.user.documentId,
      email: row.account.email,
      role: row.role.name,
    })

    return { accessToken }
  }
}
