import assert from 'node:assert/strict'
import test from 'node:test'
import { sql } from 'drizzle-orm'

process.env.TURSO_DATABASE_URL = 'file::memory:'

const dbModulePromise = import('../../index.ts')

const TABLE_NAMES = [
  'accounts',
  'account_role_lnk',
  'roles',
  'user_accounts_lnk',
  'users',
  'owner_account_lnk',
  'owners',
  'staff_account_lnk',
  'staff',
] as const

async function dropAll(db: { run: (query: ReturnType<typeof sql>) => Promise<unknown> }) {
  for (const table of TABLE_NAMES) {
    await db.run(sql.raw(`DROP TABLE IF EXISTS ${table}`))
  }
}

async function createTables() {
  const { db } = await dbModulePromise

  await db.run(sql`
    CREATE TABLE accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_id TEXT NOT NULL UNIQUE,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT,
      provider TEXT NOT NULL DEFAULT 'local',
      provider_account_id TEXT UNIQUE
    )
  `)

  await db.run(sql`
    CREATE TABLE roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_id TEXT NOT NULL UNIQUE,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT
    )
  `)

  await db.run(sql`
    CREATE TABLE account_role_lnk (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_id TEXT NOT NULL UNIQUE,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      account_id INTEGER NOT NULL UNIQUE,
      role_id INTEGER NOT NULL
    )
  `)

  await db.run(sql`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_id TEXT NOT NULL UNIQUE,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      avatar_id INTEGER,
      birthday TEXT,
      national_id TEXT,
      status TEXT NOT NULL DEFAULT 'active'
    )
  `)

  await db.run(sql`
    CREATE TABLE owners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_id TEXT NOT NULL UNIQUE,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      avatar_id INTEGER,
      birthday TEXT,
      national_id TEXT,
      status TEXT NOT NULL DEFAULT 'active'
    )
  `)

  await db.run(sql`
    CREATE TABLE staff (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_id TEXT NOT NULL UNIQUE,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      avatar_id INTEGER,
      status TEXT NOT NULL DEFAULT 'active'
    )
  `)

  await db.run(sql`
    CREATE TABLE user_accounts_lnk (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_id TEXT NOT NULL UNIQUE,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      account_id INTEGER NOT NULL
    )
  `)

  await db.run(sql`
    CREATE TABLE owner_account_lnk (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_id TEXT NOT NULL UNIQUE,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      owner_id INTEGER NOT NULL,
      account_id INTEGER NOT NULL
    )
  `)

  await db.run(sql`
    CREATE TABLE staff_account_lnk (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_id TEXT NOT NULL UNIQUE,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      staff_id INTEGER NOT NULL,
      account_id INTEGER NOT NULL
    )
  `)
}

test('orders accounts newest-first with deterministic pagination and applies email + role filters', async () => {
  const { db, findAccountsWithRolePaginated } = await dbModulePromise
  await dropAll(db)
  await createTables()

  await db.run(sql`
    INSERT INTO roles (document_id, created_at, updated_at, name, description) VALUES
      ('role-user', 100, 100, 'user', 'Regular user'),
      ('role-owner', 100, 100, 'owner', 'Owner'),
      ('role-staff', 100, 100, 'staff', 'Staff'),
      ('role-admin', 100, 100, 'admin', 'Admin')
  `)

  await db.run(sql`
    INSERT INTO accounts (document_id, created_at, updated_at, email) VALUES
      ('acc-oldest', 100, 100, 'oldest@example.com'),
      ('acc-same-b', 200, 200, 'same-b@example.com'),
      ('acc-same-a', 200, 200, 'same-a@example.com'),
      ('acc-newest', 300, 300, 'newest@example.com'),
      ('acc-owner', 150, 150, 'owner@example.com'),
      ('acc-staff', 160, 160, 'staff-alice@example.com')
  `)

  await db.run(sql`
    INSERT INTO account_role_lnk (document_id, created_at, updated_at, account_id, role_id) VALUES
      ('lnk-oldest', 100, 100, (SELECT id FROM accounts WHERE document_id = 'acc-oldest'), (SELECT id FROM roles WHERE name = 'user')),
      ('lnk-same-b', 200, 200, (SELECT id FROM accounts WHERE document_id = 'acc-same-b'), (SELECT id FROM roles WHERE name = 'user')),
      ('lnk-same-a', 200, 200, (SELECT id FROM accounts WHERE document_id = 'acc-same-a'), (SELECT id FROM roles WHERE name = 'user')),
      ('lnk-newest', 300, 300, (SELECT id FROM accounts WHERE document_id = 'acc-newest'), (SELECT id FROM roles WHERE name = 'admin')),
      ('lnk-owner', 150, 150, (SELECT id FROM accounts WHERE document_id = 'acc-owner'), (SELECT id FROM roles WHERE name = 'owner')),
      ('lnk-staff', 160, 160, (SELECT id FROM accounts WHERE document_id = 'acc-staff'), (SELECT id FROM roles WHERE name = 'staff'))
  `)

  const firstPage = await findAccountsWithRolePaginated({ page: 1, limit: 2 })
  const secondPage = await findAccountsWithRolePaginated({ page: 2, limit: 2 })

  assert.equal(firstPage.total, 6)
  assert.deepEqual(
    firstPage.rows.map((row) => row.documentId),
    ['acc-newest', 'acc-same-a']
  )
  assert.deepEqual(
    secondPage.rows.map((row) => row.documentId),
    ['acc-same-b', 'acc-staff']
  )

  const byRole = await findAccountsWithRolePaginated({ page: 1, limit: 10, role: 'user' })
  assert.deepEqual(
    byRole.rows.map((row) => row.documentId),
    ['acc-same-a', 'acc-same-b', 'acc-oldest']
  )
  assert.equal(byRole.total, 3)

  const byEmail = await findAccountsWithRolePaginated({ page: 1, limit: 10, email: 'alice' })
  assert.deepEqual(
    byEmail.rows.map((row) => row.documentId),
    ['acc-staff']
  )
  assert.equal(byEmail.total, 1)

  const combined = await findAccountsWithRolePaginated({
    page: 1,
    limit: 10,
    email: 'same',
    role: 'user',
  })
  assert.deepEqual(
    combined.rows.map((row) => row.documentId),
    ['acc-same-a', 'acc-same-b']
  )
  assert.equal(combined.total, 2)

  const byAdminRole = await findAccountsWithRolePaginated({ page: 1, limit: 10, role: 'admin' })
  assert.equal(byAdminRole.total, 1)
  assert.deepEqual(
    byAdminRole.rows.map((row) => row.documentId),
    ['acc-newest']
  )
})

test('resolves profile name per role and leaves admin accounts without a profile null', async () => {
  const { db, findAccountsWithRolePaginated } = await dbModulePromise
  await dropAll(db)
  await createTables()

  await db.run(sql`
    INSERT INTO roles (document_id, created_at, updated_at, name, description) VALUES
      ('role-user', 100, 100, 'user', NULL),
      ('role-owner', 100, 100, 'owner', NULL),
      ('role-staff', 100, 100, 'staff', NULL),
      ('role-admin', 100, 100, 'admin', NULL)
  `)

  await db.run(sql`
    INSERT INTO accounts (document_id, created_at, updated_at, email) VALUES
      ('acc-user', 100, 100, 'user@example.com'),
      ('acc-owner', 100, 100, 'owner@example.com'),
      ('acc-staff', 100, 100, 'staff@example.com'),
      ('acc-admin', 100, 100, 'admin@example.com')
  `)

  await db.run(sql`
    INSERT INTO account_role_lnk (document_id, created_at, updated_at, account_id, role_id) VALUES
      ('lnk-u', 100, 100, (SELECT id FROM accounts WHERE document_id = 'acc-user'), (SELECT id FROM roles WHERE name = 'user')),
      ('lnk-o', 100, 100, (SELECT id FROM accounts WHERE document_id = 'acc-owner'), (SELECT id FROM roles WHERE name = 'owner')),
      ('lnk-s', 100, 100, (SELECT id FROM accounts WHERE document_id = 'acc-staff'), (SELECT id FROM roles WHERE name = 'staff')),
      ('lnk-a', 100, 100, (SELECT id FROM accounts WHERE document_id = 'acc-admin'), (SELECT id FROM roles WHERE name = 'admin'))
  `)

  await db.run(sql`
    INSERT INTO users (document_id, created_at, updated_at, name, last_name, phone) VALUES
      ('prof-user', 100, 100, 'Alice', 'Smith', '+15555550001')
  `)
  await db.run(sql`
    INSERT INTO user_accounts_lnk (document_id, created_at, updated_at, user_id, account_id) VALUES
      ('lnk-ua', 100, 100, (SELECT id FROM users WHERE document_id = 'prof-user'), (SELECT id FROM accounts WHERE document_id = 'acc-user'))
  `)

  await db.run(sql`
    INSERT INTO owners (document_id, created_at, updated_at, name, last_name, phone) VALUES
      ('prof-owner', 100, 100, 'Olivia', 'Owner', '+15555550002')
  `)
  await db.run(sql`
    INSERT INTO owner_account_lnk (document_id, created_at, updated_at, owner_id, account_id) VALUES
      ('lnk-oa', 100, 100, (SELECT id FROM owners WHERE document_id = 'prof-owner'), (SELECT id FROM accounts WHERE document_id = 'acc-owner'))
  `)

  await db.run(sql`
    INSERT INTO staff (document_id, created_at, updated_at, name, last_name, phone) VALUES
      ('prof-staff', 100, 100, 'Sam', 'Staff', '+15555550003')
  `)
  await db.run(sql`
    INSERT INTO staff_account_lnk (document_id, created_at, updated_at, staff_id, account_id) VALUES
      ('lnk-sa', 100, 100, (SELECT id FROM staff WHERE document_id = 'prof-staff'), (SELECT id FROM accounts WHERE document_id = 'acc-staff'))
  `)

  const result = await findAccountsWithRolePaginated({ page: 1, limit: 10 })
  const byId = new Map(result.rows.map((row) => [row.documentId, row]))

  assert.deepEqual(
    {
      userName: byId.get('acc-user')?.userName,
      userLastName: byId.get('acc-user')?.userLastName,
      ownerName: byId.get('acc-user')?.ownerName,
      staffName: byId.get('acc-user')?.staffName,
    },
    { userName: 'Alice', userLastName: 'Smith', ownerName: null, staffName: null }
  )

  assert.deepEqual(
    {
      ownerName: byId.get('acc-owner')?.ownerName,
      ownerLastName: byId.get('acc-owner')?.ownerLastName,
      userName: byId.get('acc-owner')?.userName,
      staffName: byId.get('acc-owner')?.staffName,
    },
    { ownerName: 'Olivia', ownerLastName: 'Owner', userName: null, staffName: null }
  )

  assert.deepEqual(
    {
      staffName: byId.get('acc-staff')?.staffName,
      staffLastName: byId.get('acc-staff')?.staffLastName,
      userName: byId.get('acc-staff')?.userName,
      ownerName: byId.get('acc-staff')?.ownerName,
    },
    { staffName: 'Sam', staffLastName: 'Staff', userName: null, ownerName: null }
  )

  const admin = byId.get('acc-admin')
  assert.equal(admin?.roleName, 'admin')
  assert.equal(admin?.userName, null)
  assert.equal(admin?.userLastName, null)
  assert.equal(admin?.ownerName, null)
  assert.equal(admin?.ownerLastName, null)
  assert.equal(admin?.staffName, null)
  assert.equal(admin?.staffLastName, null)
  assert.equal(admin?.userStatus, null)
  assert.equal(admin?.ownerStatus, null)
  assert.equal(admin?.staffStatus, null)

  assert.equal(byId.get('acc-user')?.userStatus, 'active')
  assert.equal(byId.get('acc-owner')?.ownerStatus, 'active')
  assert.equal(byId.get('acc-staff')?.staffStatus, 'active')
})
