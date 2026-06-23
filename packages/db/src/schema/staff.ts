import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { STAFF_STATUS } from '@afterdark/types'
import { createBaseColumns } from './base.ts'

export const staff = sqliteTable('staff', {
  ...createBaseColumns('staff'),
  name: text('name').notNull(),
  lastName: text('last_name').notNull(),
  phone: text('phone').notNull(),
  avatar: text('avatar'),
  status: text('status', {
    enum: [STAFF_STATUS.ACTIVE, STAFF_STATUS.INACTIVE, STAFF_STATUS.PENDING],
  })
    .notNull()
    .default(STAFF_STATUS.ACTIVE),
})

export type StaffSelect = typeof staff.$inferSelect
export type StaffInsert = typeof staff.$inferInsert
