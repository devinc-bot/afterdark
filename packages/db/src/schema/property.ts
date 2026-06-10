import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { PROPERTY_STATUS } from '@afterdark/types'
import { baseColumns } from './base.ts'

export const properties = sqliteTable('properties', {
  ...baseColumns,
  name: text('name').notNull(),
  description: text('description'),
  price: real('price').notNull(),
  stock: integer('stock').notNull().default(0),
  status: text('status', { enum: [PROPERTY_STATUS.ACTIVE, PROPERTY_STATUS.INACTIVE] })
    .notNull()
    .default(PROPERTY_STATUS.ACTIVE),
})

export type PropertySelect = typeof properties.$inferSelect
export type PropertyInsert = typeof properties.$inferInsert
