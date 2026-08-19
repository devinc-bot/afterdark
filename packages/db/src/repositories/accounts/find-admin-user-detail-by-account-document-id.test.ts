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
  'addresses',
  'owner_addresses_lnk',
  'organizations',
  'organization_accounts_lnk',
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

  await db.run(sql`
    CREATE TABLE addresses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_id TEXT NOT NULL UNIQUE,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      address TEXT NOT NULL,
      street_number TEXT NOT NULL,
      state TEXT NOT NULL,
      city TEXT NOT NULL,
      latitude REAL,
      longitude REAL
    )
  `)

  await db.run(sql`
    CREATE TABLE owner_addresses_lnk (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_id TEXT NOT NULL UNIQUE,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      owner_id INTEGER NOT NULL UNIQUE,
      address_id INTEGER NOT NULL UNIQUE
    )
  `)

  await db.run(sql`
    CREATE TABLE organizations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_id TEXT NOT NULL UNIQUE,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      name TEXT NOT NULL,
      tax_id TEXT
    )
  `)

  await db.run(sql`
    CREATE TABLE organization_accounts_lnk (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_id TEXT NOT NULL UNIQUE,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      organization_id INTEGER NOT NULL,
      account_id INTEGER NOT NULL
    )
  `)
}

test('resolves account detail per role including owner address and organization', async () => {
  const { db, findAdminUserDetailByAccountDocumentId } = await dbModulePromise
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
    INSERT INTO accounts (document_id, created_at, updated_at, email, provider) VALUES
      ('acc-user', 100, 100, 'user@example.com', 'local'),
      ('acc-owner', 100, 100, 'owner@example.com', 'google'),
      ('acc-staff', 100, 100, 'staff@example.com', 'local'),
      ('acc-admin', 100, 100, 'admin@example.com', 'local')
  `)

  await db.run(sql`
    INSERT INTO account_role_lnk (document_id, created_at, updated_at, account_id, role_id) VALUES
      ('lnk-u', 100, 100, (SELECT id FROM accounts WHERE document_id = 'acc-user'), (SELECT id FROM roles WHERE name = 'user')),
      ('lnk-o', 100, 100, (SELECT id FROM accounts WHERE document_id = 'acc-owner'), (SELECT id FROM roles WHERE name = 'owner')),
      ('lnk-s', 100, 100, (SELECT id FROM accounts WHERE document_id = 'acc-staff'), (SELECT id FROM roles WHERE name = 'staff')),
      ('lnk-a', 100, 100, (SELECT id FROM accounts WHERE document_id = 'acc-admin'), (SELECT id FROM roles WHERE name = 'admin'))
  `)

  await db.run(sql`
    INSERT INTO users (document_id, created_at, updated_at, name, last_name, phone, birthday, national_id) VALUES
      ('prof-user', 100, 100, 'Alice', 'Smith', '+15555550001', '1990-01-01', '12345678')
  `)
  await db.run(sql`
    INSERT INTO user_accounts_lnk (document_id, created_at, updated_at, user_id, account_id) VALUES
      ('lnk-ua', 100, 100, (SELECT id FROM users WHERE document_id = 'prof-user'), (SELECT id FROM accounts WHERE document_id = 'acc-user'))
  `)

  await db.run(sql`
    INSERT INTO owners (document_id, created_at, updated_at, name, last_name, phone, birthday, national_id) VALUES
      ('prof-owner', 100, 100, 'Olivia', 'Owner', '+15555550002', '1985-05-05', '87654321')
  `)
  await db.run(sql`
    INSERT INTO owner_account_lnk (document_id, created_at, updated_at, owner_id, account_id) VALUES
      ('lnk-oa', 100, 100, (SELECT id FROM owners WHERE document_id = 'prof-owner'), (SELECT id FROM accounts WHERE document_id = 'acc-owner'))
  `)

  await db.run(sql`
    INSERT INTO organizations (document_id, created_at, updated_at, name, tax_id) VALUES
      ('org-1', 100, 100, 'Olivia Inc.', '30-12345678-9')
  `)
  await db.run(sql`
    INSERT INTO organization_accounts_lnk (document_id, created_at, updated_at, organization_id, account_id) VALUES
      ('lnk-org', 100, 100, (SELECT id FROM organizations WHERE document_id = 'org-1'), (SELECT id FROM accounts WHERE document_id = 'acc-owner'))
  `)

  await db.run(sql`
    INSERT INTO addresses (document_id, created_at, updated_at, address, street_number, state, city) VALUES
      ('addr-1', 100, 100, 'Av. Siempre Viva', '742', 'CABA', 'Buenos Aires')
  `)
  await db.run(sql`
    INSERT INTO owner_addresses_lnk (document_id, created_at, updated_at, owner_id, address_id) VALUES
      ('lnk-addr', 100, 100, (SELECT id FROM owners WHERE document_id = 'prof-owner'), (SELECT id FROM addresses WHERE document_id = 'addr-1'))
  `)

  await db.run(sql`
    INSERT INTO staff (document_id, created_at, updated_at, name, last_name, phone) VALUES
      ('prof-staff', 100, 100, 'Sam', 'Staff', '+15555550003')
  `)
  await db.run(sql`
    INSERT INTO staff_account_lnk (document_id, created_at, updated_at, staff_id, account_id) VALUES
      ('lnk-sa', 100, 100, (SELECT id FROM staff WHERE document_id = 'prof-staff'), (SELECT id FROM accounts WHERE document_id = 'acc-staff'))
  `)

  const userDetail = await findAdminUserDetailByAccountDocumentId('acc-user')
  assert.equal(userDetail?.roleName, 'user')
  assert.equal(userDetail?.name, 'Alice')
  assert.equal(userDetail?.phone, '+15555550001')
  assert.equal(userDetail?.birthday, '1990-01-01')
  assert.equal(userDetail?.nationalId, '12345678')
  assert.equal(userDetail?.status, 'active')
  assert.equal(userDetail?.address, null)

  const ownerDetail = await findAdminUserDetailByAccountDocumentId('acc-owner')
  assert.equal(ownerDetail?.roleName, 'owner')
  assert.equal(ownerDetail?.name, 'Olivia')
  assert.equal(ownerDetail?.provider, 'google')
  assert.equal(ownerDetail?.organizationName, 'Olivia Inc.')
  assert.equal(ownerDetail?.taxId, '30-12345678-9')
  assert.deepEqual(ownerDetail?.address, {
    address: 'Av. Siempre Viva',
    streetNumber: '742',
    state: 'CABA',
    city: 'Buenos Aires',
  })

  const staffDetail = await findAdminUserDetailByAccountDocumentId('acc-staff')
  assert.equal(staffDetail?.roleName, 'staff')
  assert.equal(staffDetail?.name, 'Sam')
  assert.equal(staffDetail?.phone, '+15555550003')
  assert.equal(staffDetail?.birthday, null)
  assert.equal(staffDetail?.nationalId, null)

  const adminDetail = await findAdminUserDetailByAccountDocumentId('acc-admin')
  assert.equal(adminDetail?.roleName, 'admin')
  assert.equal(adminDetail?.email, 'admin@example.com')
  assert.equal(adminDetail?.name, null)
  assert.equal(adminDetail?.phone, null)
  assert.equal(adminDetail?.address, null)

  const missing = await findAdminUserDetailByAccountDocumentId('does-not-exist')
  assert.equal(missing, null)
})
