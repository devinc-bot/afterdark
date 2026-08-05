import assert from 'node:assert/strict'
import { rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { after, before, test } from 'node:test'
import { eq, sql } from 'drizzle-orm'

const testDatabasePath = join(tmpdir(), 'afterdark-consume-ticket-test.db')

for (const suffix of ['', '-shm', '-wal']) {
  rmSync(`${testDatabasePath}${suffix}`, { force: true })
}

process.env.NODE_ENV = 'test'
process.env.TURSO_DATABASE_URL = `file:${testDatabasePath}`

const { db } = await import('../../client.ts')
const { ticketsSold } = await import('../../schema/tickets_sold.ts')
const { consumeTicketSoldById } = await import('./consume-ticket-sold-by-id.ts')

before(async () => {
  await db.run(sql.raw('PRAGMA journal_mode = WAL'))
  await db.run(sql.raw('PRAGMA busy_timeout = 1000'))
  await db.run(
    sql.raw(`
      CREATE TABLE tickets_sold (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        document_id TEXT NOT NULL UNIQUE,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        order_id INTEGER NOT NULL,
        qr_code TEXT NOT NULL UNIQUE,
        checked_in INTEGER DEFAULT 0 NOT NULL,
        used_at INTEGER
      )
    `)
  )
})

after(() => {
  db.$client.close()
})

test('concurrent attempts consume a sold ticket exactly once', async () => {
  const [ticket] = await db
    .insert(ticketsSold)
    .values({ orderId: 1, qrCode: 'concurrent-ticket-qr' })
    .returning({ id: ticketsSold.id })

  assert.ok(ticket)

  const usedAt = new Date('2026-08-05T20:00:00.000Z')
  const results = await Promise.all([
    consumeTicketSoldById({ ticketSoldId: ticket.id, usedAt }),
    consumeTicketSoldById({ ticketSoldId: ticket.id, usedAt }),
  ])

  assert.equal(results.filter(Boolean).length, 1)

  const persisted = await db
    .select({ checkedIn: ticketsSold.checkedIn, usedAt: ticketsSold.usedAt })
    .from(ticketsSold)
    .where(eq(ticketsSold.id, ticket.id))
    .get()

  assert.equal(persisted?.checkedIn, true)
  assert.deepEqual(persisted?.usedAt, usedAt)
})
