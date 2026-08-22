import assert from 'node:assert/strict'
import { rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { sql } from 'drizzle-orm'

const databasePath = join(tmpdir(), 'afterdark-organizations-test.db')
for (const path of [databasePath, `${databasePath}-shm`, `${databasePath}-wal`]) {
  rmSync(path, { force: true })
}
process.env.TURSO_DATABASE_URL = `file:${databasePath.replaceAll('\\', '/')}`

const dbModulePromise = import('../../index.ts')

test.after(async () => {
  const { db } = await dbModulePromise
  db.$client.close()
})

test('resolves only a sole owner organization and updates settings transactionally', async () => {
  const {
    db,
    findCurrentOwnerByDocumentId,
    findSoleOrganizationByOwnerDocumentId,
    updateOwnerByDocumentId,
  } = await dbModulePromise

  await db.run(sql`CREATE TABLE accounts (id INTEGER PRIMARY KEY, email TEXT NOT NULL)`)
  await db.run(sql`CREATE TABLE assets (id INTEGER PRIMARY KEY, url TEXT)`)
  await db.run(sql`
    CREATE TABLE owners (
      id INTEGER PRIMARY KEY,
      document_id TEXT NOT NULL,
      name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      avatar_id INTEGER,
      birthday TEXT,
      national_id TEXT,
      status TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `)
  await db.run(sql`
    CREATE TABLE owner_account_lnk (
      id INTEGER PRIMARY KEY,
      owner_id INTEGER NOT NULL,
      account_id INTEGER NOT NULL
    )
  `)
  await db.run(sql`
    CREATE TABLE organizations (
      id INTEGER PRIMARY KEY,
      document_id TEXT NOT NULL,
      name TEXT NOT NULL,
      slug TEXT,
      tax_id TEXT,
      updated_at INTEGER NOT NULL
    )
  `)
  await db.run(sql`
    CREATE TABLE organization_accounts_lnk (
      id INTEGER PRIMARY KEY,
      organization_id INTEGER NOT NULL,
      account_id INTEGER NOT NULL
    )
  `)
  await db.run(sql`
    CREATE TABLE addresses (
      id INTEGER PRIMARY KEY,
      address TEXT NOT NULL,
      street_number TEXT NOT NULL,
      state TEXT NOT NULL,
      city TEXT NOT NULL
    )
  `)
  await db.run(sql`
    CREATE TABLE owner_addresses_lnk (
      id INTEGER PRIMARY KEY,
      owner_id INTEGER NOT NULL,
      address_id INTEGER NOT NULL
    )
  `)

  await db.run(sql`
    INSERT INTO accounts (id, email) VALUES
      (1, 'zero@example.com'),
      (2, 'one@example.com'),
      (3, 'multiple@example.com')
  `)
  await db.run(sql`
    INSERT INTO owners (
      id, document_id, name, last_name, phone, status, updated_at
    ) VALUES
      (1, 'owner-zero', 'Zero', 'Owner', '11111111', 'active', 100),
      (2, 'owner-one', 'One', 'Owner', '22222222', 'active', 100),
      (3, 'owner-multiple', 'Multiple', 'Owner', '33333333', 'active', 100)
  `)
  await db.run(sql`
    INSERT INTO owner_account_lnk (id, owner_id, account_id) VALUES
      (1, 1, 1), (2, 2, 2), (3, 3, 3)
  `)
  await db.run(sql`
    INSERT INTO organizations (id, document_id, name, tax_id, updated_at) VALUES
      (1, 'organization-one', 'One Org', '20329642330', 100),
      (2, 'organization-two', 'Two Org', NULL, 100)
  `)
  await db.run(sql`
    INSERT INTO organization_accounts_lnk (id, organization_id, account_id) VALUES
      (1, 1, 2), (2, 1, 3), (3, 2, 3)
  `)

  assert.equal(await findSoleOrganizationByOwnerDocumentId('owner-zero'), null)
  assert.deepEqual(await findSoleOrganizationByOwnerDocumentId('owner-one'), {
    id: 1,
    documentId: 'organization-one',
    name: 'One Org',
    taxId: '20329642330',
  })
  assert.equal(await findSoleOrganizationByOwnerDocumentId('owner-multiple'), null)

  assert.equal(await findCurrentOwnerByDocumentId('owner-zero'), null)
  assert.equal(await findCurrentOwnerByDocumentId('owner-multiple'), null)

  await updateOwnerByDocumentId('owner-one', {
    name: 'Updated',
    lastName: 'Owner',
    phone: '44444444',
    birthday: null,
    nationalId: null,
    organizationName: '',
    taxId: null,
  })

  const currentOwner = await findCurrentOwnerByDocumentId('owner-one')
  assert.equal(currentOwner?.name, 'Updated')
  assert.equal(currentOwner?.phone, '44444444')
  assert.equal(currentOwner?.organizationName, 'Updated Owner')
  assert.equal(currentOwner?.taxId, null)

  await assert.rejects(
    updateOwnerByDocumentId('owner-multiple', {
      name: 'Invalid',
      lastName: 'Owner',
      phone: '55555555',
      birthday: null,
      nationalId: null,
      organizationName: 'Invalid Org',
      taxId: null,
    }),
    /exactly one organization/
  )
})
