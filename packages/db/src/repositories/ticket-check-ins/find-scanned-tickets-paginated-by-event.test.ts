import assert from 'node:assert/strict'
import { rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { sql } from 'drizzle-orm'

const databasePath = join(tmpdir(), 'afterdark-scanned-tickets-test.db')
for (const path of [databasePath, `${databasePath}-shm`, `${databasePath}-wal`]) {
  rmSync(path, { force: true })
}
process.env.TURSO_DATABASE_URL = `file:${databasePath.replaceAll('\\', '/')}`

const dbModulePromise = import('../../index.ts')

test.after(async () => {
  const { db } = await dbModulePromise
  db.$client.close()
})

test('returns scanned tickets ordered by scan time with operator resolution and pagination', async () => {
  const { db, findScannedTicketsPaginatedByEvent } = await dbModulePromise

  await db.run(sql`CREATE TABLE accounts (id INTEGER PRIMARY KEY, email TEXT)`)
  await db.run(
    sql`CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, last_name TEXT, phone TEXT)`
  )
  await db.run(
    sql`CREATE TABLE user_accounts_lnk (id INTEGER PRIMARY KEY, user_id INTEGER, account_id INTEGER)`
  )
  await db.run(sql`CREATE TABLE owners (id INTEGER PRIMARY KEY, name TEXT, last_name TEXT)`)
  await db.run(
    sql`CREATE TABLE owner_account_lnk (id INTEGER PRIMARY KEY, account_id INTEGER, owner_id INTEGER)`
  )
  await db.run(sql`CREATE TABLE staff (id INTEGER PRIMARY KEY, name TEXT, last_name TEXT)`)
  await db.run(
    sql`CREATE TABLE staff_account_lnk (id INTEGER PRIMARY KEY, account_id INTEGER, staff_id INTEGER)`
  )
  await db.run(sql`CREATE TABLE events (id INTEGER PRIMARY KEY, document_id TEXT)`)
  await db.run(
    sql`CREATE TABLE tickets (id INTEGER PRIMARY KEY, name TEXT, type TEXT, event_id INTEGER)`
  )
  await db.run(
    sql`CREATE TABLE orders (id INTEGER PRIMARY KEY, ticket_id INTEGER, user_id INTEGER)`
  )
  await db.run(sql`
    CREATE TABLE tickets_sold (
      id INTEGER PRIMARY KEY,
      order_id INTEGER,
      checked_in INTEGER,
      used_at INTEGER,
      checked_in_by_account_id INTEGER,
      checked_in_by_role TEXT
    )
  `)

  await db.run(sql`
    INSERT INTO accounts (id, email) VALUES
      (1, 'ada@example.com'),
      (2, 'alan@example.com'),
      (3, 'grace@example.com'),
      (10, 'owner@example.com'),
      (11, 'staff@example.com')
  `)
  await db.run(sql`
    INSERT INTO users (id, name, last_name, phone) VALUES
      (1, 'Ada', 'Lovelace', '11111111'),
      (2, 'Alan', 'Turing', '22222222'),
      (3, 'Grace', 'Hopper', '33333333')
  `)
  await db.run(sql`
    INSERT INTO user_accounts_lnk (id, user_id, account_id) VALUES (1, 1, 1), (2, 2, 2), (3, 3, 3)
  `)
  await db.run(sql`INSERT INTO owners (id, name, last_name) VALUES (100, 'Owner', 'One')`)
  await db.run(sql`INSERT INTO owner_account_lnk (id, account_id, owner_id) VALUES (1, 10, 100)`)
  await db.run(sql`INSERT INTO staff (id, name, last_name) VALUES (200, 'Staff', 'Two')`)
  await db.run(sql`INSERT INTO staff_account_lnk (id, account_id, staff_id) VALUES (1, 11, 200)`)
  await db.run(sql`INSERT INTO events (id, document_id) VALUES (1, 'event-one')`)
  await db.run(sql`
    INSERT INTO tickets (id, name, type, event_id) VALUES
      (1, 'General', 'general', 1),
      (2, 'VIP', 'vip', 1)
  `)
  await db.run(sql`
    INSERT INTO orders (id, ticket_id, user_id) VALUES
      (1, 1, 1),
      (2, 2, 2),
      (3, 1, 3)
  `)
  await db.run(sql`
    INSERT INTO tickets_sold (
      id, order_id, checked_in, used_at, checked_in_by_account_id, checked_in_by_role
    ) VALUES
      (1, 1, 1, 1000, 10, 'owner'),
      (2, 2, 1, 3000, 11, 'staff'),
      (3, 3, 1, 2000, NULL, NULL),
      (4, 2, 0, NULL, NULL, NULL),
      (5, 3, 1, 1000, NULL, NULL)
  `)

  const firstPage = await findScannedTicketsPaginatedByEvent({
    eventDocumentId: 'event-one',
    page: 1,
    limit: 2,
  })
  assert.equal(firstPage.total, 4)
  assert.deepEqual(
    firstPage.rows.map((row) => row.scannedAt.getTime()),
    [3000, 2000]
  )

  const secondPage = await findScannedTicketsPaginatedByEvent({
    eventDocumentId: 'event-one',
    page: 2,
    limit: 2,
  })
  assert.equal(secondPage.total, 4)
  assert.deepEqual(
    secondPage.rows.map((row) => row.scannedAt.getTime()),
    [1000, 1000]
  )
  assert.deepEqual(
    secondPage.rows.map((row) => row.operator.fullName),
    [null, 'Owner One']
  )

  const staffRow = firstPage.rows[0]
  assert.deepEqual(staffRow?.operator, {
    accountId: 11,
    fullName: 'Staff Two',
    email: 'staff@example.com',
    role: 'staff',
  })
  assert.equal(staffRow?.ticket.name, 'VIP')
  assert.equal(staffRow?.purchaser.name, 'Alan')
  assert.equal(staffRow?.purchaser.email, 'alan@example.com')

  const preMigrationRow = firstPage.rows[1]
  assert.deepEqual(preMigrationRow?.operator, {
    accountId: null,
    fullName: null,
    email: null,
    role: null,
  })
  assert.equal(preMigrationRow?.purchaser.name, 'Grace')
  assert.equal(preMigrationRow?.ticket.name, 'General')
})
