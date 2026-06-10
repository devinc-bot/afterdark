import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { TICKET_STATUS, TICKET_TYPE } from '@afterdark/types'
import { baseColumns } from './base.ts'
import { clubs } from './club.ts'

export const tickets = sqliteTable('tickets', {
  ...baseColumns,
  name: text('name').notNull(),
  price: real('price').notNull(),
  quantity: integer('quantity').notNull(),
  status: text('status', { enum: [TICKET_STATUS.ACTIVE, TICKET_STATUS.INACTIVE] })
    .notNull()
    .default(TICKET_STATUS.ACTIVE),
  startDate: integer('start_date', { mode: 'timestamp' }).notNull(),
  endDate: integer('end_date', { mode: 'timestamp' }).notNull(),
  description: text('description').notNull(),
  clubId: integer('club_id')
    .notNull()
    .references(() => clubs.id),
  type: text('type', { enum: [TICKET_TYPE.GENERAL, TICKET_TYPE.VIP] })
    .notNull()
    .default(TICKET_TYPE.GENERAL),
})

export type TicketSelect = typeof tickets.$inferSelect
export type TicketInsert = typeof tickets.$inferInsert
