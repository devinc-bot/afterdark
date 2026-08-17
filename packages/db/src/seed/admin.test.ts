import assert from 'node:assert/strict'
import test from 'node:test'
import { createClient } from '@libsql/client'
import { compare } from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/libsql'
import { AUTH_PROVIDER, USER_ROLE } from '@repo/types'
import { seedEnvSchema } from '@repo/validators'
import { accounts } from '../schema/account.ts'
import { accountRolesLnk } from '../schema/account-role-lnk.ts'
import { roles } from '../schema/role.ts'
import * as schema from '../schema/index.ts'
import { seedAdmin } from './admin.ts'

const SEED_SCHEMA_SQL = `
  CREATE TABLE roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    document_id TEXT NOT NULL UNIQUE,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT
  );
  CREATE TABLE accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    document_id TEXT NOT NULL UNIQUE,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT,
    provider TEXT NOT NULL DEFAULT 'local',
    provider_account_id TEXT UNIQUE
  );
  CREATE TABLE account_role_lnk (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    document_id TEXT NOT NULL UNIQUE,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    account_id INTEGER NOT NULL UNIQUE REFERENCES accounts(id),
    role_id INTEGER NOT NULL REFERENCES roles(id)
  );
`

async function createSeedDatabase() {
  const client = createClient({ url: 'file::memory:' })
  await client.executeMultiple(SEED_SCHEMA_SQL)
  const database = drizzle(client, { schema })

  const [adminRole] = await database
    .insert(roles)
    .values({ documentId: 'seed-role-admin', name: USER_ROLE.ADMIN })
    .returning({ id: roles.id })
  const [userRole] = await database
    .insert(roles)
    .values({ documentId: 'seed-role-user', name: USER_ROLE.USER })
    .returning({ id: roles.id })

  return { client, database, adminRole, userRole }
}

test('requires explicit credentials for the admin seed', () => {
  assert.equal(seedEnvSchema.safeParse({}).success, false)
})

test('creates, rotates, and repairs a seeded admin account', async () => {
  const { client, database, adminRole, userRole } = await createSeedDatabase()

  try {
    await seedAdmin(database, {
      SEED_ADMIN_EMAIL: 'admin@example.com',
      SEED_ADMIN_PASSWORD: 'InitialPassword123@',
    })

    const [createdAccount] = await database
      .select()
      .from(accounts)
      .where(eq(accounts.email, 'admin@example.com'))
    assert.equal(createdAccount.provider, AUTH_PROVIDER.LOCAL)
    assert.equal(await compare('InitialPassword123@', createdAccount.password ?? ''), true)

    await database
      .update(accountRolesLnk)
      .set({ roleId: userRole.id })
      .where(eq(accountRolesLnk.accountId, createdAccount.id))

    await seedAdmin(database, {
      SEED_ADMIN_EMAIL: 'admin@example.com',
      SEED_ADMIN_PASSWORD: 'RotatedPassword123@',
    })

    const [updatedAccount] = await database
      .select()
      .from(accounts)
      .where(eq(accounts.id, createdAccount.id))
    const [roleLink] = await database
      .select()
      .from(accountRolesLnk)
      .where(eq(accountRolesLnk.accountId, createdAccount.id))

    assert.equal(await compare('RotatedPassword123@', updatedAccount.password ?? ''), true)
    assert.equal(roleLink.roleId, adminRole.id)
  } finally {
    client.close()
  }
})
