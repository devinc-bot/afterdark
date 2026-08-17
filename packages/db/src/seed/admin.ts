import { hash } from 'bcryptjs'
import { eq } from 'drizzle-orm'
import type { LibSQLDatabase } from 'drizzle-orm/libsql'
import { AUTH_PROVIDER, USER_ROLE } from '@repo/types'
import type { SeedEnv } from '@repo/validators'
import { accounts } from '../schema/account.ts'
import { accountRolesLnk } from '../schema/account-role-lnk.ts'
import { roles } from '../schema/role.ts'
import * as schema from '../schema/index.ts'

const BCRYPT_SALT_ROUNDS = 10

type SeedDatabase = LibSQLDatabase<typeof schema>
type AdminSeedEnv = Pick<SeedEnv, 'SEED_ADMIN_EMAIL' | 'SEED_ADMIN_PASSWORD'>

export async function seedAdmin(database: SeedDatabase, seedEnv: AdminSeedEnv): Promise<void> {
  const [adminRole] = await database
    .select({ id: roles.id })
    .from(roles)
    .where(eq(roles.name, USER_ROLE.ADMIN))
    .limit(1)

  if (!adminRole) throw new Error(`Role not found: ${USER_ROLE.ADMIN}`)

  const password = await hash(seedEnv.SEED_ADMIN_PASSWORD, BCRYPT_SALT_ROUNDS)
  const [existingAccount] = await database
    .select({ id: accounts.id })
    .from(accounts)
    .where(eq(accounts.email, seedEnv.SEED_ADMIN_EMAIL))
    .limit(1)

  const accountId =
    existingAccount?.id ??
    (
      await database
        .insert(accounts)
        .values({
          email: seedEnv.SEED_ADMIN_EMAIL,
          password,
          provider: AUTH_PROVIDER.LOCAL,
        })
        .returning({ id: accounts.id })
    )[0].id

  if (existingAccount) {
    await database
      .update(accounts)
      .set({
        password,
        provider: AUTH_PROVIDER.LOCAL,
        providerAccountId: null,
        updatedAt: new Date(),
      })
      .where(eq(accounts.id, accountId))
  }

  const [existingRoleLink] = await database
    .select({ id: accountRolesLnk.id })
    .from(accountRolesLnk)
    .where(eq(accountRolesLnk.accountId, accountId))
    .limit(1)

  if (existingRoleLink) {
    await database
      .update(accountRolesLnk)
      .set({ roleId: adminRole.id, updatedAt: new Date() })
      .where(eq(accountRolesLnk.id, existingRoleLink.id))
    return
  }

  await database.insert(accountRolesLnk).values({
    accountId,
    roleId: adminRole.id,
  })
}
