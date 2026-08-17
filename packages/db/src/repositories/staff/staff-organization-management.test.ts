import assert from 'node:assert/strict'
import { rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { sql } from 'drizzle-orm'
import { STAFF_STATUS } from '@repo/types'

const databasePath = join(tmpdir(), 'afterdark-staff-management-test.db')
for (const path of [databasePath, `${databasePath}-shm`, `${databasePath}-wal`]) {
  rmSync(path, { force: true })
}
process.env.TURSO_DATABASE_URL = `file:${databasePath.replaceAll('\\', '/')}`

const dbModulePromise = import('../../index.ts')

test.after(async () => {
  const { db } = await dbModulePromise
  db.$client.close()
})

test('manages staff through organization memberships without removing unrelated access', async () => {
  const {
    db,
    deleteStaffByDocumentId,
    findPersonnelByOwnerDocumentId,
    updateStaffStatusByDocumentId,
  } = await dbModulePromise

  await db.run(sql`PRAGMA foreign_keys=ON`)
  await db.run(sql`CREATE TABLE assets (id INTEGER PRIMARY KEY, url TEXT)`)
  await db.run(sql`
    CREATE TABLE accounts (
      id INTEGER PRIMARY KEY,
      document_id TEXT NOT NULL,
      email TEXT NOT NULL
    )
  `)
  await db.run(sql`CREATE TABLE roles (id INTEGER PRIMARY KEY)`)
  await db.run(sql`
    CREATE TABLE owners (
      id INTEGER PRIMARY KEY,
      document_id TEXT NOT NULL,
      name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      status TEXT NOT NULL
    )
  `)
  await db.run(sql`
    CREATE TABLE owner_account_lnk (
      id INTEGER PRIMARY KEY,
      owner_id INTEGER NOT NULL REFERENCES owners(id),
      account_id INTEGER NOT NULL REFERENCES accounts(id)
    )
  `)
  await db.run(sql`
    CREATE TABLE organizations (
      id INTEGER PRIMARY KEY,
      document_id TEXT NOT NULL,
      name TEXT NOT NULL,
      tax_id TEXT
    )
  `)
  await db.run(sql`
    CREATE TABLE organization_accounts_lnk (
      id INTEGER PRIMARY KEY,
      organization_id INTEGER NOT NULL REFERENCES organizations(id),
      account_id INTEGER NOT NULL REFERENCES accounts(id),
      UNIQUE(organization_id, account_id)
    )
  `)
  await db.run(sql`
    CREATE TABLE staff (
      id INTEGER PRIMARY KEY,
      document_id TEXT NOT NULL,
      name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      avatar_id INTEGER REFERENCES assets(id),
      status TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `)
  await db.run(sql`
    CREATE TABLE staff_account_lnk (
      id INTEGER PRIMARY KEY,
      staff_id INTEGER NOT NULL REFERENCES staff(id),
      account_id INTEGER NOT NULL REFERENCES accounts(id)
    )
  `)
  await db.run(sql`
    CREATE TABLE account_role_lnk (
      id INTEGER PRIMARY KEY,
      account_id INTEGER NOT NULL REFERENCES accounts(id),
      role_id INTEGER NOT NULL REFERENCES roles(id)
    )
  `)

  await db.run(sql`
    INSERT INTO accounts (id, document_id, email) VALUES
      (1, 'owner-account-one', 'owner-one@example.com'),
      (2, 'owner-account-two', 'owner-two@example.com'),
      (3, 'owner-account-multiple', 'owner-multiple@example.com'),
      (10, 'staff-account-single', 'single@example.com'),
      (11, 'staff-account-multiple', 'multiple@example.com'),
      (12, 'staff-account-unrelated', 'unrelated@example.com')
  `)
  await db.run(sql`
    INSERT INTO owners (id, document_id, name, last_name, phone, status) VALUES
      (1, 'owner-one', 'One', 'Owner', '11111111', 'active'),
      (2, 'owner-two', 'Two', 'Owner', '22222222', 'active'),
      (3, 'owner-multiple', 'Multiple', 'Owner', '33333333', 'active')
  `)
  await db.run(sql`
    INSERT INTO owner_account_lnk (id, owner_id, account_id) VALUES
      (1, 1, 1), (2, 2, 2), (3, 3, 3)
  `)
  await db.run(sql`
    INSERT INTO organizations (id, document_id, name) VALUES
      (1, 'organization-one', 'Organization One'),
      (2, 'organization-two', 'Organization Two')
  `)
  await db.run(sql`
    INSERT INTO organization_accounts_lnk (id, organization_id, account_id) VALUES
      (1, 1, 1), (2, 2, 2),
      (3, 1, 3), (4, 2, 3),
      (10, 1, 10),
      (11, 1, 11), (12, 2, 11),
      (13, 2, 12)
  `)
  await db.run(sql`
    INSERT INTO staff (
      id, document_id, name, last_name, phone, status, updated_at
    ) VALUES
      (10, 'staff-single', 'Single', 'Staff', '44444444', 'active', 100),
      (11, 'staff-multiple', 'Multiple', 'Staff', '55555555', 'active', 300),
      (12, 'staff-unrelated', 'Unrelated', 'Staff', '66666666', 'active', 200)
  `)
  await db.run(sql`
    INSERT INTO staff_account_lnk (id, staff_id, account_id) VALUES
      (10, 10, 10), (11, 11, 11), (12, 12, 12)
  `)
  await db.run(sql`INSERT INTO roles (id) VALUES (4)`)
  await db.run(sql`
    INSERT INTO account_role_lnk (id, account_id, role_id) VALUES
      (10, 10, 4), (11, 11, 4), (12, 12, 4)
  `)

  const organizationOnePersonnel = await findPersonnelByOwnerDocumentId('owner-one')
  assert.deepEqual(
    organizationOnePersonnel.map((item) => item.staffDocumentId),
    ['staff-multiple', 'staff-single']
  )
  assert.equal(organizationOnePersonnel[0]?.organizationDocumentId, 'organization-one')
  assert.deepEqual(await findPersonnelByOwnerDocumentId('owner-multiple'), [])

  assert.equal(
    await updateStaffStatusByDocumentId('staff-multiple', 'owner-one', STAFF_STATUS.INACTIVE),
    true
  )
  assert.equal(
    await updateStaffStatusByDocumentId('staff-unrelated', 'owner-one', STAFF_STATUS.INACTIVE),
    false
  )

  assert.equal(await deleteStaffByDocumentId('staff-multiple', 'owner-one'), true)
  const retainedStaff = await db.all(sql`
    SELECT staff.document_id, organization_accounts_lnk.organization_id
    FROM staff
    INNER JOIN staff_account_lnk ON staff_account_lnk.staff_id = staff.id
    INNER JOIN organization_accounts_lnk
      ON organization_accounts_lnk.account_id = staff_account_lnk.account_id
    WHERE staff.document_id = 'staff-multiple'
  `)
  assert.deepEqual(retainedStaff, [{ document_id: 'staff-multiple', organization_id: 2 }])

  assert.equal(await deleteStaffByDocumentId('staff-multiple', 'owner-two'), true)
  assert.deepEqual(await db.all(sql`SELECT id FROM accounts WHERE id = 11`), [])
  assert.deepEqual(await db.all(sql`SELECT id FROM staff WHERE id = 11`), [])

  assert.equal(await deleteStaffByDocumentId('staff-unrelated', 'owner-one'), false)
})
