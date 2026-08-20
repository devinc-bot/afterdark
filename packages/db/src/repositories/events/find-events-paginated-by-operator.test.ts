import assert from 'node:assert/strict'
import { rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { sql } from 'drizzle-orm'
import { USER_ROLE } from '@repo/types'

const databasePath = join(tmpdir(), 'afterdark-events-by-operator-test.db')
for (const path of [databasePath, `${databasePath}-shm`, `${databasePath}-wal`]) {
  rmSync(path, { force: true })
}
process.env.TURSO_DATABASE_URL = `file:${databasePath.replaceAll('\\', '/')}`

const dbModulePromise = import('../../index.ts')

test.after(async () => {
  const { db } = await dbModulePromise
  db.$client.close()
})

test('lists operator events and filters to events with completed sales', async () => {
  const { db, findEventsPaginatedByOperator } = await dbModulePromise

  await db.run(sql`CREATE TABLE owners (id INTEGER PRIMARY KEY, document_id TEXT)`)
  await db.run(
    sql`CREATE TABLE owner_account_lnk (id INTEGER PRIMARY KEY, owner_id INTEGER, account_id INTEGER)`
  )
  await db.run(
    sql`CREATE TABLE organizations (id INTEGER PRIMARY KEY, document_id TEXT, name TEXT, tax_id TEXT)`
  )
  await db.run(
    sql`CREATE TABLE organization_accounts_lnk (id INTEGER PRIMARY KEY, organization_id INTEGER, account_id INTEGER)`
  )
  await db.run(sql`
    CREATE TABLE locations (
      id INTEGER PRIMARY KEY,
      document_id TEXT,
      created_at INTEGER,
      updated_at INTEGER,
      name TEXT,
      capacity TEXT,
      description TEXT,
      owner_id INTEGER
    )
  `)
  await db.run(sql`
    CREATE TABLE events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_id TEXT,
      created_at INTEGER,
      updated_at INTEGER,
      location_id INTEGER,
      organization_id INTEGER,
      name TEXT,
      description TEXT,
      starts_at INTEGER,
      ends_at INTEGER,
      location TEXT,
      status TEXT
    )
  `)
  await db.run(sql`
    CREATE TABLE event_faqs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_id TEXT,
      created_at INTEGER,
      updated_at INTEGER,
      event_id INTEGER,
      question TEXT,
      answer TEXT,
      sort_order INTEGER
    )
  `)
  await db.run(sql`CREATE TABLE tickets (id INTEGER PRIMARY KEY, event_id INTEGER)`)
  await db.run(sql`CREATE TABLE orders (id INTEGER PRIMARY KEY, ticket_id INTEGER, status TEXT)`)
  await db.run(sql`CREATE TABLE tickets_sold (id INTEGER PRIMARY KEY, order_id INTEGER)`)

  await db.run(sql`
    INSERT INTO owners (id, document_id) VALUES (1, 'owner-one')
  `)
  await db.run(sql`INSERT INTO owner_account_lnk (id, owner_id, account_id) VALUES (1, 1, 1)`)
  await db.run(sql`
    INSERT INTO organizations (id, document_id, name) VALUES (1, 'organization-one', 'Organization One')
  `)
  await db.run(sql`
    INSERT INTO organization_accounts_lnk (id, organization_id, account_id) VALUES (1, 1, 1)
  `)
  await db.run(sql`
    INSERT INTO locations (id, document_id, created_at, updated_at, name, capacity, owner_id)
    VALUES (1, 'location-one', 100, 100, 'Location One', '100', 1)
  `)
  await db.run(sql`
    INSERT INTO events (
      id, document_id, created_at, updated_at, location_id, organization_id,
      name, description, starts_at, ends_at, status
    ) VALUES
      (1, 'event-with-sales', 100, 100, 1, 1, 'With Sales', 'Desc', 1000, 2000, 'published'),
      (2, 'event-without-sales', 200, 200, 1, 1, 'Without Sales', 'Desc', 3000, 4000, 'published')
  `)
  await db.run(sql`
    INSERT INTO tickets (id, event_id) VALUES (1, 1), (2, 2)
  `)
  await db.run(sql`
    INSERT INTO orders (id, ticket_id, status) VALUES (1, 1, 'completed'), (2, 2, 'pending')
  `)
  await db.run(sql`INSERT INTO tickets_sold (id, order_id) VALUES (1, 1)`)

  const all = await findEventsPaginatedByOperator({
    operatorDocumentId: 'owner-one',
    operatorRole: USER_ROLE.OWNER,
    page: 1,
    limit: 10,
  })
  assert.equal(all.total, 2)
  assert.deepEqual(
    all.rows.map(({ event }) => event.documentId),
    ['event-without-sales', 'event-with-sales']
  )

  const withSales = await findEventsPaginatedByOperator({
    operatorDocumentId: 'owner-one',
    operatorRole: USER_ROLE.OWNER,
    page: 1,
    limit: 10,
    hasSales: true,
  })
  assert.equal(withSales.total, 1)
  assert.deepEqual(
    withSales.rows.map(({ event }) => event.documentId),
    ['event-with-sales']
  )
})
