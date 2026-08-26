import { integer, pgTable, text, uniqueIndex } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { createBaseColumns } from './base.ts'
import { owners } from './owner.ts'

export const ticketTypes = pgTable(
  'ticket_types',
  {
    ...createBaseColumns('ticket_types'),
    name: text('name').notNull(),
    ownerId: integer('owner_id').references(() => owners.id, { onDelete: 'cascade' }),
  },
  (table) => [
    uniqueIndex('ticket_types_global_name_unique')
      .on(sql`lower(${table.name})`)
      .where(sql`${table.ownerId} is null`),
    uniqueIndex('ticket_types_owner_name_unique')
      .on(table.ownerId, sql`lower(${table.name})`)
      .where(sql`${table.ownerId} is not null`),
  ]
)

export type TicketTypeSelect = typeof ticketTypes.$inferSelect
export type TicketTypeInsert = typeof ticketTypes.$inferInsert
