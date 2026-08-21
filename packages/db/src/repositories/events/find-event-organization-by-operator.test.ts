import assert from 'node:assert/strict'
import { rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { sql } from 'drizzle-orm'
import { USER_ROLE } from '@repo/types'

const databasePath = join(tmpdir(), 'afterdark-event-organization-operator-test.db')
for (const path of [databasePath, `${databasePath}-shm`, `${databasePath}-wal`]) {
  rmSync(path, { force: true })
}
process.env.TURSO_DATABASE_URL = `file:${databasePath.replaceAll('\\', '/')}`

const dbModulePromise = import('../../index.ts')

test.after(async () => {
  const { db } = await dbModulePromise
  db.$client.close()
})

test('authorizes event history reads only for organization members', async () => {
  const { db, findEventOrganizationByOperator } = await dbModulePromise

  await db.run(
    sql`CREATE TABLE organizations (id INTEGER PRIMARY KEY, document_id TEXT, name TEXT, tax_id TEXT)`
  )
  await db.run(
    sql`CREATE TABLE organization_accounts_lnk (id INTEGER PRIMARY KEY, organization_id INTEGER, account_id INTEGER)`
  )
  await db.run(sql`CREATE TABLE owners (id INTEGER PRIMARY KEY, document_id TEXT)`)
  await db.run(
    sql`CREATE TABLE owner_account_lnk (id INTEGER PRIMARY KEY, owner_id INTEGER, account_id INTEGER)`
  )
  await db.run(sql`CREATE TABLE staff (id INTEGER PRIMARY KEY, document_id TEXT)`)
  await db.run(
    sql`CREATE TABLE staff_account_lnk (id INTEGER PRIMARY KEY, staff_id INTEGER, account_id INTEGER)`
  )
  await db.run(
    sql`CREATE TABLE events (id INTEGER PRIMARY KEY, document_id TEXT, organization_id INTEGER)`
  )

  await db.run(sql`
    INSERT INTO organizations (id, document_id, name, tax_id) VALUES
      (1, 'organization-one', 'Organization One', NULL),
      (2, 'organization-two', 'Organization Two', NULL)
  `)
  await db.run(sql`
    INSERT INTO organization_accounts_lnk (id, organization_id, account_id) VALUES
      (1, 1, 1), (2, 2, 2), (3, 1, 10), (4, 2, 11)
  `)
  await db.run(sql`
    INSERT INTO owners (id, document_id) VALUES (1, 'owner-one'), (2, 'owner-two')
  `)
  await db.run(sql`
    INSERT INTO owner_account_lnk (id, owner_id, account_id) VALUES (1, 1, 1), (2, 2, 2)
  `)
  await db.run(sql`
    INSERT INTO staff (id, document_id) VALUES (10, 'staff-one'), (11, 'staff-two')
  `)
  await db.run(sql`
    INSERT INTO staff_account_lnk (id, staff_id, account_id) VALUES (10, 10, 10), (11, 11, 11)
  `)
  await db.run(sql`
    INSERT INTO events (id, document_id, organization_id) VALUES (1, 'event-one', 1)
  `)

  assert.deepEqual(
    await findEventOrganizationByOperator({
      operatorDocumentId: 'owner-one',
      operatorRole: USER_ROLE.OWNER,
      eventDocumentId: 'event-one',
    }),
    { id: 1, documentId: 'organization-one', name: 'Organization One', taxId: null }
  )
  assert.equal(
    await findEventOrganizationByOperator({
      operatorDocumentId: 'owner-two',
      operatorRole: USER_ROLE.OWNER,
      eventDocumentId: 'event-one',
    }),
    null
  )
  assert.deepEqual(
    await findEventOrganizationByOperator({
      operatorDocumentId: 'staff-one',
      operatorRole: USER_ROLE.STAFF,
      eventDocumentId: 'event-one',
    }),
    { id: 1, documentId: 'organization-one', name: 'Organization One', taxId: null }
  )
  assert.equal(
    await findEventOrganizationByOperator({
      operatorDocumentId: 'staff-two',
      operatorRole: USER_ROLE.STAFF,
      eventDocumentId: 'event-one',
    }),
    null
  )
  assert.equal(
    await findEventOrganizationByOperator({
      operatorDocumentId: 'owner-one',
      operatorRole: USER_ROLE.USER,
      eventDocumentId: 'event-one',
    }),
    null
  )
})
