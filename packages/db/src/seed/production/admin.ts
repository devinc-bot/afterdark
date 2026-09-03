import { compare, hash } from 'bcryptjs'
import { eq } from 'drizzle-orm'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { AUTH_PROVIDER, USER_ROLE } from '@repo/types'
import type { SeedEnv } from '@repo/validators'
import { accounts } from '../../schema/account.ts'
import { accountRolesLnk } from '../../schema/account-role-lnk.ts'
import { roles } from '../../schema/role.ts'
import * as schema from '../../schema/index.ts'

const BCRYPT_SALT_ROUNDS = 10

type SeedDatabase = NodePgDatabase<typeof schema>
type AdminSeedEnv = Pick<SeedEnv, 'SEED_ADMIN_EMAIL' | 'SEED_ADMIN_PASSWORD'>

export async function seedAdmin(database: SeedDatabase, seedEnv: AdminSeedEnv): Promise<void> {
  const [adminRole] = await database
    .select({ id: roles.id })
    .from(roles)
    .where(eq(roles.name, USER_ROLE.ADMIN))
    .limit(1)

  if (!adminRole) throw new Error(`Role not found: ${USER_ROLE.ADMIN}`)

  const [existingAccount] = await database
    .select({ id: accounts.id, password: accounts.password })
    .from(accounts)
    .where(eq(accounts.email, seedEnv.SEED_ADMIN_EMAIL))
    .limit(1)

  const accountId = existingAccount
    ? existingAccount.id
    : (
        await database
          .insert(accounts)
          .values({
            email: seedEnv.SEED_ADMIN_EMAIL,
            password: await hash(seedEnv.SEED_ADMIN_PASSWORD, BCRYPT_SALT_ROUNDS),
            provider: AUTH_PROVIDER.LOCAL,
          })
          .returning({ id: accounts.id })
      )[0].id

  // Rehash only when the configured password no longer matches the stored hash.
  if (
    existingAccount &&
    (!existingAccount.password ||
      !(await compare(seedEnv.SEED_ADMIN_PASSWORD, existingAccount.password)))
  ) {
    await database
      .update(accounts)
      .set({
        password: await hash(seedEnv.SEED_ADMIN_PASSWORD, BCRYPT_SALT_ROUNDS),
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
