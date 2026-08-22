import assert from 'node:assert/strict'
import { rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { sql } from 'drizzle-orm'
import { EVENT_STATUS } from '@repo/types'

const databasePath = join(tmpdir(), 'afterdark-event-organization-test.db')
for (const path of [databasePath, `${databasePath}-shm`, `${databasePath}-wal`]) {
  rmSync(path, { force: true })
}
process.env.TURSO_DATABASE_URL = `file:${databasePath.replaceAll('\\', '/')}`

const dbModulePromise = import('../../index.ts')

test.after(async () => {
  const { db } = await dbModulePromise
  db.$client.close()
})

test('uses direct organization ownership for owner and public event queries', async () => {
  const {
    createEvent,
    db,
    findEventOwnedByOwnerDocumentId,
    findEventsPaginatedByOwner,
    findPublishedEventByDocumentId,
    findPublishedEventBySlug,
  } = await dbModulePromise

  await db.run(sql`
    CREATE TABLE accounts (id INTEGER PRIMARY KEY, document_id TEXT NOT NULL, email TEXT NOT NULL)
  `)
  await db.run(sql`CREATE TABLE assets (id INTEGER PRIMARY KEY, url TEXT)`)
  await db.run(sql`
    CREATE TABLE owners (
      id INTEGER PRIMARY KEY,
      document_id TEXT NOT NULL,
      name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      avatar_id INTEGER,
      status TEXT NOT NULL
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
      tax_id TEXT
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
    CREATE TABLE locations (
      id INTEGER PRIMARY KEY,
      document_id TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      name TEXT NOT NULL,
      capacity TEXT NOT NULL,
      description TEXT,
      owner_id INTEGER NOT NULL
    )
  `)
  await db.run(sql`
    CREATE TABLE events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_id TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      location_id INTEGER NOT NULL,
      organization_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      slug TEXT,
      description TEXT NOT NULL,
      starts_at INTEGER NOT NULL,
      ends_at INTEGER NOT NULL,
      location TEXT,
      status TEXT NOT NULL
    )
  `)
  await db.run(sql`
    CREATE TABLE event_faqs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_id TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      event_id INTEGER NOT NULL,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      sort_order INTEGER NOT NULL
    )
  `)
  await db.run(sql`
    CREATE TABLE addresses (
      id INTEGER PRIMARY KEY,
      document_id TEXT NOT NULL,
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
    CREATE TABLE location_addresses_lnk (
      id INTEGER PRIMARY KEY,
      location_id INTEGER NOT NULL,
      address_id INTEGER NOT NULL
    )
  `)

  await db.run(sql`
    INSERT INTO accounts (id, document_id, email) VALUES
      (1, 'account-one', 'one@example.com'),
      (2, 'account-two', 'two@example.com'),
      (3, 'account-invalid', 'invalid@example.com')
  `)
  await db.run(sql`
    INSERT INTO owners (id, document_id, name, last_name, phone, status) VALUES
      (1, 'owner-one', 'One', 'Owner', '11111111', 'active'),
      (2, 'owner-two', 'Two', 'Owner', '22222222', 'active'),
      (3, 'owner-invalid', 'Invalid', 'Owner', '33333333', 'active')
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
      (1, 1, 1), (2, 2, 2), (3, 1, 3), (4, 2, 3)
  `)
  await db.run(sql`
    INSERT INTO locations (
      id, document_id, created_at, updated_at, name, capacity, owner_id
    ) VALUES (1, 'location-one', 100, 100, 'Location One', '100', 1)
  `)
  await db.run(sql`
    INSERT INTO addresses (
      id, document_id, created_at, updated_at, address, street_number, state, city
    ) VALUES (1, 'address-one', 100, 100, 'Main', '1', 'State', 'City')
  `)
  await db.run(sql`
    INSERT INTO location_addresses_lnk (id, location_id, address_id) VALUES (1, 1, 1)
  `)

  const first = await createEvent({
    locationId: 1,
    organizationId: 1,
    name: 'First Event',
    description: 'First',
    startsAt: new Date(1_000_000),
    endsAt: new Date(2_000_000),
    status: EVENT_STATUS.PUBLISHED,
    faqs: [],
  })
  const second = await createEvent({
    locationId: 1,
    organizationId: 1,
    name: 'Second Event',
    description: 'Second',
    startsAt: new Date(3_000_000),
    endsAt: new Date(4_000_000),
    status: EVENT_STATUS.DRAFT,
    faqs: [],
  })
  await db.run(sql`
    UPDATE events SET created_at = 100 WHERE id = ${first.event.id}
  `)
  await db.run(sql`
    UPDATE events SET created_at = 200 WHERE id = ${second.event.id}
  `)

  const ownerEvents = await findEventsPaginatedByOwner({
    ownerDocumentId: 'owner-one',
    page: 1,
    limit: 10,
  })
  assert.equal(ownerEvents.total, 2)
  assert.deepEqual(
    ownerEvents.rows.map(({ event }) => event.documentId),
    [second.event.documentId, first.event.documentId]
  )
  assert.equal(
    (await findEventOwnedByOwnerDocumentId(first.event.documentId, 'owner-one'))?.id,
    first.event.id
  )
  assert.equal(await findEventOwnedByOwnerDocumentId(first.event.documentId, 'owner-two'), null)
  assert.deepEqual(
    await findEventsPaginatedByOwner({
      ownerDocumentId: 'owner-invalid',
      page: 1,
      limit: 10,
    }),
    { rows: [], total: 0 }
  )

  await db.run(sql`
    UPDATE events SET organization_id = 2 WHERE id = ${first.event.id}
  `)
  const published = await findPublishedEventByDocumentId(first.event.documentId)
  assert.equal(published?.organizer.organizationName, 'Organization Two')
  assert.equal(published?.organizer.name, 'One')
  assert.equal((await findPublishedEventBySlug('first-event'))?.event.id, first.event.id)
})
