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
import {
  accounts,
  accountRolesLnk,
  db,
  ownerAccountsLnk,
  owners,
  roles,
  staff,
  staffAccountsLnk,
  userAccountsLnk,
  users,
  type Transaction,
} from '@afterdark/db'
import {
  USER_ROLE,
  type LoginResponse,
  type RegisterResponse,
  type UserRole,
} from '@afterdark/types'
import type { LoginInput, RegisterOwnerInput, RegisterUserInput } from '@afterdark/validators'
import { AUTH_MESSAGE } from './auth.constants'

const PASSWORD_SALT_ROUNDS = 10

type AuthAccountRow = {
  sub: string
  account: typeof accounts.$inferSelect
  role: typeof roles.$inferSelect
}

type ProfileSeed = {
  name: string
  lastName: string
  phone: string
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

  async registerUser(input: RegisterUserInput): Promise<RegisterResponse> {
    return this.register(input, USER_ROLE.USER)
  }

  async registerOwner(input: RegisterOwnerInput): Promise<RegisterResponse> {
    return this.register(input, USER_ROLE.OWNER)
  }

  private async register(input: RegisterUserInput, roleName: UserRole): Promise<RegisterResponse> {
    const [existingAccount] = await db
      .select({ id: accounts.id })
      .from(accounts)
      .where(eq(accounts.email, input.email))
      .limit(1)

    if (existingAccount) {
      throw new ConflictException(AUTH_MESSAGE.EMAIL_ALREADY_REGISTERED)
    }

    const [role] = await db.select().from(roles).where(eq(roles.name, roleName)).limit(1)

    if (!role) {
      throw new InternalServerErrorException(AUTH_MESSAGE.ROLE_NOT_CONFIGURED)
    }

    const hashedPassword = await hash(input.password, PASSWORD_SALT_ROUNDS)

    await db.transaction(async (tx: Transaction) => {
      const [account] = await tx
        .insert(accounts)
        .values({
          email: input.email,
          password: hashedPassword,
        })
        .returning()

      const profileSeed: ProfileSeed = {
        name: input.name,
        lastName: input.lastName,
        phone: '',
      }

      await this.createProfileForRole(tx, account.id, roleName, profileSeed)

      await tx.insert(accountRolesLnk).values({
        accountId: account.id,
        roleId: role.id,
      })
    })

    return { message: AUTH_MESSAGE.REGISTER_SUCCESS }
  }

  private async findAccountByEmail(email: string): Promise<AuthAccountRow | null> {
    const [account] = await db.select().from(accounts).where(eq(accounts.email, email)).limit(1)

    if (!account) {
      return null
    }

    const [roleRow] = await db
      .select({ roleName: roles.name, role: roles })
      .from(accountRolesLnk)
      .innerJoin(roles, eq(roles.id, accountRolesLnk.roleId))
      .where(eq(accountRolesLnk.accountId, account.id))
      .limit(1)

    if (!roleRow) {
      return null
    }

    const roleName = roleRow.roleName as UserRole
    const sub = await this.findProfileDocumentId(account.id, roleName)

    if (!sub) {
      return null
    }

    return {
      sub,
      account,
      role: roleRow.role,
    }
  }

  private async findProfileDocumentId(accountId: number, roleName: string): Promise<string | null> {
    if (roleName === USER_ROLE.OWNER) {
      const [row] = await db
        .select({ documentId: owners.documentId })
        .from(ownerAccountsLnk)
        .innerJoin(owners, eq(owners.id, ownerAccountsLnk.ownerId))
        .where(eq(ownerAccountsLnk.accountId, accountId))
        .limit(1)

      return row?.documentId ?? null
    }

    if (roleName === USER_ROLE.STAFF) {
      const [row] = await db
        .select({ documentId: staff.documentId })
        .from(staffAccountsLnk)
        .innerJoin(staff, eq(staff.id, staffAccountsLnk.staffId))
        .where(eq(staffAccountsLnk.accountId, accountId))
        .limit(1)

      return row?.documentId ?? null
    }

    if (roleName === USER_ROLE.USER) {
      const [row] = await db
        .select({ documentId: users.documentId })
        .from(userAccountsLnk)
        .innerJoin(users, eq(users.id, userAccountsLnk.userId))
        .where(eq(userAccountsLnk.accountId, accountId))
        .limit(1)

      return row?.documentId ?? null
    }

    if (roleName === USER_ROLE.ADMIN) {
      const [row] = await db
        .select({ documentId: accounts.documentId })
        .from(accounts)
        .where(eq(accounts.id, accountId))
        .limit(1)

      return row?.documentId ?? null
    }

    return null
  }

  private async createProfileForRole(
    tx: Transaction,
    accountId: number,
    roleName: UserRole,
    profile: ProfileSeed
  ): Promise<string> {
    if (roleName === USER_ROLE.OWNER) {
      const [owner] = await tx.insert(owners).values(profile).returning()

      await tx.insert(ownerAccountsLnk).values({
        ownerId: owner.id,
        accountId,
      })

      return owner.documentId
    }

    if (roleName === USER_ROLE.STAFF) {
      const [staffMember] = await tx.insert(staff).values(profile).returning()

      await tx.insert(staffAccountsLnk).values({
        staffId: staffMember.id,
        accountId,
      })

      return staffMember.documentId
    }

    if (roleName === USER_ROLE.USER) {
      const [user] = await tx.insert(users).values(profile).returning()

      await tx.insert(userAccountsLnk).values({
        userId: user.id,
        accountId,
      })

      return user.documentId
    }

    throw new InternalServerErrorException(AUTH_MESSAGE.ROLE_NOT_CONFIGURED)
  }

  private async createAccessToken(row: AuthAccountRow): Promise<LoginResponse> {
    const accessToken = await this.jwtService.signAsync({
      sub: row.sub,
      email: row.account.email,
      role: row.role.name,
    })

    return { accessToken }
  }
}
